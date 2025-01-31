import { conf } from '../config.js';
import { Scenes, session, Telegraf } from 'telegraf';
import { pause } from './helpers/utils.js';
import { phrases } from './helpers/bot_phrases.js';
import keyboards, { MainMenuButtons } from './helpers/keyboard.js';
import { Search_Scene } from './controllers/search_scene.js';
import { Account_Scene } from './controllers/account_scene.js';
import { Support_Scene } from './controllers/support_scene.js';
import db from './helpers/database.js';

export const bot = new Telegraf<Scenes.SceneContext>(conf.botToken);

const account = new Account_Scene();
const search = new Search_Scene();
const support = new Support_Scene();

const stage = new Scenes.Stage<Scenes.SceneContext>(
  [search.scene, account.scene, support.scene],
  {
    ttl: 1800,
  },
);

bot.use(session());
bot.use(stage.middleware());

(async (): Promise<void> => {
  await pause(1000);

  bot.command('menu', async (ctx) => {
    await checkUser(ctx);
    return ctx.replyWithHTML(phrases.main, keyboards.mainMenu());
  });

  bot.action(`${MainMenuButtons.SEARCH.callback_data}`, (ctx) => {
    return ctx.scene.enter(search.sceneKey);
  });

  bot.action(`${MainMenuButtons.ACCOUNT.callback_data}`, (ctx) => {
    return ctx.scene.enter(account.sceneKey);
  });

  bot.action(`${MainMenuButtons.SUPPORT.callback_data}`, (ctx) => {
    return ctx.scene.enter(support.sceneKey);
  });

  bot.launch();
})();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

async function checkUser(сtx): Promise<void> {
  let _user = await db.getUser(сtx.update.message.from.id);

  if (!_user) {
    console.log('Юзер не зарегистрирован');

    _user = {
      id: сtx.update.message.from.id,
      balance: 0,
      created_at: сtx.update.message.date,
      subscribtionTo: Math.floor(Date.now() / 1000),
      tasks: {},
      max_tasks_num: 0,
      ads_1: {},
      ads_2: {},
      ads_3: {},
    };
    await db.setUserListener(_user);
  } else if (_user.subscribtionTo < Math.floor(Date.now() / 1000)) {
    console.log('Пописка юзера окончена');

    _user.tasks = {};
    _user.max_tasks_num = 0;
    _user.ads_1 = {};
    _user.ads_2 = {};
    _user.ads_3 = {};

    await db.setUserListener(_user);
  }
}

// npm run build:watch
// node build/src/main.js
