import { Scenes } from 'telegraf';
import { phrases } from '../helpers/bot_phrases.js';
import keyboards, {
  Back,
  CALLBACK_SEPARATOR,
  MainSearchButtons,
  SubBack,
} from '../helpers/keyboard.js';
import db from '../helpers/database.js';
import { runSearchJob } from '../helpers/search_job.js';
import { cities } from '../helpers/cities.js';
import { isNumberWithoutSpaces } from '../helpers/utils.js';

const MAX_INPUT_LENGTH = 64;

const CALLBACK_KEY = 'TASK' + CALLBACK_SEPARATOR;

export class Search_Scene {
  public scene: any;
  public sceneKey = 'search_scene';

  private isTextInputActive: boolean;
  private iterationStep: number;
  private editSearchValues: any[];

  constructor() {
    this.scene = new Scenes.BaseScene<Scenes.SceneContext>(this.sceneKey);
    this.scene.enter((ctx) => this.enter(ctx));
    this.scene.leave((ctx) => this.leave(ctx));

    this.scene.action(`${MainSearchButtons.START.callback_data}`, (сtx) =>
      this.startStopTasksMain(сtx),
    );

    this.scene.action(`${MainSearchButtons.STOP.callback_data}`, (ctx) =>
      this.startStopTasksMain(ctx),
    );

    this.scene.action(`${MainSearchButtons.EDIT.callback_data}`, (ctx) =>
      this.editTasksMain(ctx),
    );

    const regExp = new RegExp(`^${CALLBACK_KEY}[a-zA-Z0-9]*`);
    this.scene.action(regExp, (ctx) => this.initTask(ctx));

    this.scene.action(`${Back.BACK.callback_data}`, (ctx) => ctx.scene.leave());
    this.scene.action(`${SubBack.BACK.callback_data}`, (ctx) =>
      this.enter(ctx),
    );
    this.scene.on('text', (ctx) => this.editTask(ctx));
  }

  private async enter(ctx): Promise<void> {
    return ctx.replyWithHTML(phrases.search_main, keyboards.mainSearchMenu());
  }

  private leave(ctx): void {
    return ctx.replyWithHTML(phrases.main, keyboards.mainMenu());
  }

  private async startStopTasksMain(ctx): Promise<any> {
    let callback_data = ctx.update.callback_query;
    let _user = await db.getUser(callback_data.from.id);

    if (Object.keys(_user.tasks).length === 0) {
      return ctx.replyWithHTML(
        phrases.search_start_stop_main_error(callback_data.data),
        keyboards.subBack(),
      );
    } else {
      ctx.replyWithHTML(
        phrases.search_start_stop_main(callback_data.data),
        keyboards.tasksMenu(_user.tasks, callback_data.data),
      );
    }
  }

  private async editTasksMain(ctx) {
    let _user = await db.getUser(ctx.update.callback_query.from.id);

    ctx.replyWithHTML(
      phrases.tasks_edit_main,
      keyboards.tasksMenuToEdit(_user.max_tasks_num),
    );
  }

  private async initTask(ctx) {
    let messageArray = ctx.update.callback_query.data.split(CALLBACK_SEPARATOR);
    let id = messageArray[1];

    if (messageArray[2] === 'EDIT') {
      this.reset();
      this.editSearchValues.push(id);
      ctx.replyWithHTML(phrases.task_edit, keyboards.subBack());
    } else if (messageArray[2] === 'START') {
      let _user = await db.getUser(ctx.update.callback_query.from.id);

      if (!_user.tasks[id].is_Active) {
        _user.tasks[id].is_Active = true;
        await db.editTask(_user.id, _user.tasks);
        runSearchJob(_user, id);
        await ctx.replyWithHTML(phrases.success);
        ctx.scene.leave();
      } else {
        ctx.replyWithHTML(phrases.error, keyboards.mainSearchMenu());
      }
    } else {
      let _user = await db.getUser(ctx.update.callback_query.from.id);
      if (_user.tasks[id].is_Active) {
        _user.tasks[id].is_Active = false;

        await db.editTask(_user.id, _user.tasks);

        ctx.replyWithHTML(phrases.success, keyboards.mainSearchMenu());
      } else {
        ctx.replyWithHTML(phrases.error, keyboards.mainSearchMenu());
      }
    }
  }

  private async editTask(ctx): Promise<any> {
    if (this.isTextInputActive) {
      let text = this.predifyInputValue(ctx.update.message.text);
      if (text == '') {
        ctx.replyWithHTML(phrases.error);
        return;
      }
      this.editSearchValues.push(text);

      if (this.iterationStep == 4) {
        let tasks = await db.getTasks(ctx.update.message.from.id);
        tasks[this.editSearchValues[0]] = {
          id: this.editSearchValues[0],
          cron: '*/1 * * * *',
          query: this.editSearchValues[1],
          city: this.editSearchValues[2],
          dostavka: this.editSearchValues[3],
          is_Active: false,
          price_From: this.editSearchValues[4],
          price_To: this.editSearchValues[5],
        };

        await db.editTask(ctx.update.message.from.id, tasks);
        await db.setNewAds(
          ctx.update.message.from.id,
          this.editSearchValues[0],
          {},
        );

        await ctx.reply(phrases.success);
        ctx.scene.leave();
        this.isTextInputActive = false;
      } else {
        ctx.reply(phrases.steps[this.iterationStep]);
        this.iterationStep++;
      }
    }
  }

  private reset() {
    this.iterationStep = 0;
    this.isTextInputActive = true;
    this.editSearchValues = [];
  }

  predifyInputValue(_text: any) {
    if (_text.length > MAX_INPUT_LENGTH || _text.length == 0) {
      return '';
    }
    let t: string;
    switch (this.iterationStep) {
      case 0:
        t = _text.replace(/ /g, '+').toLowerCase();
        break;

      case 1:
        t = cities[_text.toLowerCase()] || '';
        if (t) {
          t = t.replace(/ /g, '_');
        }
        break;

      case 2:
        t =
          _text.toLowerCase() === 'да'
            ? '1'
            : _text.toLowerCase() === 'нет'
              ? '0'
              : '';
        break;

      case 3:
        t = isNumberWithoutSpaces(_text) ? _text : '';
        break;

      case 4:
        t = isNumberWithoutSpaces(_text) ? _text : '';
        t = Number(Number(_text) > this.editSearchValues[4]) ? _text : '';
        break;
    }
    return t;
  }
}
