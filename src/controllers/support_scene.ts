import { Scenes } from 'telegraf';
import { phrases } from '../helpers/bot_phrases.js';
import keyboards from '../helpers/keyboard.js';
import db from '../helpers/database.js';

export class Support_Scene {
  public scene: any;
  sceneKey = 'support_scene';

  constructor() {
    this.scene = new Scenes.BaseScene<Scenes.SceneContext>(this.sceneKey);
    this.scene.enter((ctx) => this.enter(ctx));
    this.scene.leave((ctx) => this.leave(ctx));

    this.scene.on('text', (ctx) => this.initMessege(ctx));

    this.scene.action(`END_DIALOG`, (ctx) => this.endDialog(ctx));
    this.scene.action(`MAIN_MENU`, (ctx) => ctx.scene.leave());
  }

  private async enter(ctx) {
    return ctx.replyWithHTML(
      phrases.support_main,
      keyboards.endSupportDialog(),
    );
  }

  private leave(ctx) {
    return ctx.replyWithHTML(phrases.main, keyboards.mainMenu());
  }

  private async initMessege(ctx): Promise<any> {
    let support_messege = await db.getSupportMessage(
      ctx.update.message.from.id,
    );
    if (!support_messege || support_messege.is_Answered) {
      support_messege = {
        id: ctx.update.message.from.id,
        created_at: ctx.update.message.date,
        text: ctx.update.message.text,
        answer_text: '',
        is_Answered: false,
      };

      await db.sendSupportMessage(support_messege);

      ctx.replyWithHTML(phrases.support_messege_send, {
        reply_to_message_id: ctx.message.message_id,
        ...keyboards.endSupportDialog(),
      });
    } else {
      ctx.replyWithHTML(
        phrases.support_messege_error,
        keyboards.initMainMenu(),
      );
    }
  }

  private endDialog(ctx) {
    return ctx.replyWithHTML(phrases.support_end, keyboards.initMainMenu());
  }
}
