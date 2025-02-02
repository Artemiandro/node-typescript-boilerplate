import { Scenes } from 'telegraf';
import { phrases } from '../helpers/bot_phrases.js';
import keyboards, { Back } from '../helpers/keyboard.js';
import db, { User } from '../helpers/database.js';

export class Admin_Scene {
  public scene: any;
  public sceneKey = 'admin_scene';

  constructor() {
    this.scene = new Scenes.BaseScene<Scenes.SceneContext>(this.sceneKey);
    this.scene.enter((ctx) => this.enter(ctx));
    this.scene.leave((ctx) => this.leave(ctx));

    this.scene.action(`GET_SUPPORT_MES`, (ctx) => this.getSupportMessages(ctx));
    this.scene.action(`${Back.BACK.callback_data}`, (ctx) => ctx.scene.leave());
  }

  private async enter(ctx): Promise<void> {
    console.log('Enter stage Admin');

    return ctx.reply(phrases.admin_main, keyboards.getSupportMessages());
  }

  private leave(ctx): void {
    console.log('Leave stage Admin');
    return ctx.replyWithHTML(phrases.main, keyboards.mainMenu());
  }

  private getSupportMessages(ctx): void {
    console.log('Getting mes');
  }
}
