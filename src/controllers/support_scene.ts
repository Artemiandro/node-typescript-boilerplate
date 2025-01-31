import { Scenes } from 'telegraf';
import { phrases } from '../helpers/bot_phrases.js';
import keyboards from '../helpers/keyboard.js';

export class Support_Scene {
  sceneKey = 'SUPPORT_SCENE';

  scene = new Scenes.BaseScene<Scenes.SceneContext>(this.sceneKey);

  constructor() {
    this.scene.enter((ctx) => {
      ctx.replyWithHTML(phrases.support_main, keyboards.back());
    });

    this.scene.on('text', async (ctx) => {
      const supportMessage = ctx.message.text;
      // Here you can save the support message to your database or send it to your support team
      console.log('Support request:', supportMessage);
      await ctx.reply(
        'Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.',
      );
      return ctx.scene.leave();
    });

    this.scene.action('BACK', (ctx) => {
      return ctx.scene.leave();
    });
  }
}
