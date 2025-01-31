import axios from 'axios';
import jsdom from 'jsdom';
import db, { Ad, Collection, User } from './database.js';
import { compareCollections, pause } from './utils.js';
import { CronJob } from 'cron';
import { bot } from '../main.js';
const { JSDOM } = jsdom;

const baseUrl = 'https://www.avito.ru/';
let job: CronJob;
let initSkip: boolean;
let searchLetters = ['Z', 'V', 'U', 'X', 'J', 'T'];
let indexLetters = 0;

function createJob(user: User, id: number): CronJob {
  console.log('Создаю задачу ' + id);
  return new CronJob(user.tasks[id].cron, async () => {
    await pause(3000);

    let html: string;
    try {
      // console.log(
      //   `${baseUrl}${task.city}?cd=1&d=${task.dostavka}&f=ASgCAgECAUXGmgw${searchLetters[indexLetters]}${encodeFilter(Number(task.priceFrom), Number(task.priceTo))}&q=${task.query}&s=104`,
      // );
      // return;
      let resp = await axios.get(
        `${baseUrl}${user.tasks[id].city}?cd=1&d=${user.tasks[id].dostavka}&f=ASgCAgECAUXGmgw${searchLetters[indexLetters]}${encodeFilter(Number(user.tasks[id].price_From), Number(user.tasks[id].price_To))}&q=${user.tasks[id].query}&s=104`,
      );
      html = resp.data;
    } catch (error) {
      console.log(`Axios error ${error}`);
      if (searchLetters.length + 1 > indexLetters) {
        indexLetters++;
      } else {
        indexLetters = 0;
      }
      return;
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;
    const items = document.querySelectorAll('[data-marker=item]');
    const parsedAds: Collection<Ad> = {};

    items.forEach((node) => {
      parsedAds[node.id] = {
        id: node.id,
        title: node.querySelector('[itemprop=name]').textContent,
        price: Number(
          node.querySelector('[itemprop=price]').getAttribute('content'),
        ),
        url: node.querySelector('[itemprop=url]').getAttribute('href'),
        description: node
          .querySelector('[itemprop=description]')
          .getAttribute('content'),
        date: node.querySelector('[data-marker=item-date]').textContent,
      };
    });

    let data = await db.getSaveAds(user);
    let savedAds: Collection<Ad> = data[`ads_${id}`];
    if (Object.keys(savedAds).length === 0) {
      console.log('Empty dict');
      initSkip = true;
    }

    const newIds = compareCollections(savedAds, parsedAds);
    console.log(newIds);

    let tasks = await db.getTasks(user.id);
    if (!tasks[id].is_Active) {
      job.stop();
      return;
    }

    let filteredNewAdv: Collection<Ad> = {};
    for (const id of newIds) {
      filteredNewAdv[id] = parsedAds[id];
      if (!initSkip) {
        if (
          parsedAds[id].date.includes('минут') ||
          parsedAds[id].date.includes('секунд')
        ) {
          bot.telegram.sendMessage(user.id, notifyUser(parsedAds[id]));
          await pause(750);
        }
      }
    }
    initSkip = false;

    for (const t of Object.keys(savedAds)) {
      filteredNewAdv[t] = savedAds[t];
    }

    await db.setNewAds(user, id, filteredNewAdv);
    await pause(750);
  });
}

function encodeFilter(from: number, to: number): string {
  const json = JSON.stringify({ from, to });
  const base64 = Buffer.from(json).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function notifyUser(data: Ad): string {
  return `Появился новый товар ${data.title} c ценой ${data.price} руб
Описание ${data.description}
Опубликован ${data.date}
Ссылка на объявление https://avito.ru${data.url}`;
}

export async function runSearchJob(user: User, id: number) {
  await pause(5000);
  console.log(
    `Получена задача ${user.tasks[id].id} для пользователя ${user.id}`,
  );

  job = createJob(user, id);
  job.start();
}
