import { Scenes } from 'telegraf';
import { phrases } from '../helpers/bot_phrases.js';
import keyboards, {
  Back,
  MainAccountButtons,
  SubBack,
} from '../helpers/keyboard.js';
import db, { User } from '../helpers/database.js';
import { isNumberWithoutSpaces } from '../helpers/utils.js';

const LOCAL_CALLBACK_SEPARATOR = ':';
const CALLBACK_SEPARATOR = '_!!_';
const CALLBACK_KEY = 'SUB' + CALLBACK_SEPARATOR;
const PROMO_TEXT = 'avito25';
const PROMO_DAYS = 1;
const PROMO_PRICE = 0;
const PROMO_NUM_TASKS = 1;
const SUB_NUM_TASKS = 3;

export class Account_Scene {
  public scene: any;
  public sceneKey = 'account_scene';
  private user: User;

  constructor() {
    this.scene = new Scenes.BaseScene<Scenes.SceneContext>(this.sceneKey);
    this.scene.enter((ctx) => this.enter(ctx));
    this.scene.leave((ctx) => this.leave(ctx));

    this.scene.action(
      `${MainAccountButtons.SUBSCRIBTION.callback_data}`,
      (ctx) => this.manageSubscription(ctx),
    );

    this.scene.action(`${MainAccountButtons.UPBALANCE.callback_data}`, (ctx) =>
      this.manageUpBalance(ctx),
    );

    this.scene.action(`${MainAccountButtons.PROMO.callback_data}`, (ctx) =>
      this.managePromo(ctx),
    );

    const regExp = new RegExp(`^${CALLBACK_KEY}[a-zA-Z0-9]*`);
    this.scene.action(regExp, (ctx) => this.initSub(ctx));

    this.scene.on('text', (ctx) => this.applyInput(ctx));

    this.scene.action(`${Back.BACK.callback_data}`, (ctx) => ctx.scene.leave());
    this.scene.action(`${SubBack.BACK.callback_data}`, (ctx) =>
      this.enter(ctx),
    );
  }

  private async enter(ctx): Promise<void> {
    this.user = await db.getUser(ctx.update.callback_query.from.id);

    console.log('Enter stage Account');

    return ctx.replyWithHTML(
      phrases.account_main(this.user),
      keyboards.mainAccountMenu(),
    );
  }

  private leave(ctx): void {
    console.log('Leave stage Account');
    return ctx.replyWithHTML(phrases.main, keyboards.mainMenu());
  }

  private manageSubscription(ctx): void {
    console.log('Enter sub main');
    return ctx.replyWithHTML(
      phrases.subscribrion_main,
      keyboards.subscribtionMenu(),
    );
  }

  private manageUpBalance(ctx): void {
    console.log('Enter up balance main');
    return ctx.replyWithHTML(
      phrases.up_balance_main,
      keyboards.upBalanceMenu(),
    );
  }

  private managePromo(ctx): void {
    console.log('Enter promo main');
    return ctx.replyWithHTML(phrases.promo_main, keyboards.subBack());
  }

  private async initSub(ctx): Promise<any> {
    this.user = await db.getUser(ctx.update.callback_query.from.id);
    const messageArray =
      ctx.update.callback_query.data.split(CALLBACK_SEPARATOR);
    const actionType = messageArray[2];

    if (actionType === 'EDIT') {
      await this.handleEditSubscription(ctx, messageArray[1]);
    } else if (actionType === 'PRICE') {
      ctx.replyWithHTML(
        phrases.init_pay,
        keyboards.initPay(Number(messageArray[1])),
      );
    } else if (actionType === 'PAY') {
      // платежный шлюз
      let cost = messageArray[1];
      console.log(`Готово к отправке для пополенения ${cost} рублей`);
    }
  }

  private async handleEditSubscription(ctx, editData: string): Promise<void> {
    const editSubValues = editData.split(LOCAL_CALLBACK_SEPARATOR);
    const cost = Number(editSubValues[1]);

    if (this.user.balance >= cost) {
      await this.applySubscription(
        ctx.update.callback_query.from.id,
        SUB_NUM_TASKS,
        Number(editSubValues[0]),
        cost,
      );
      ctx.replyWithHTML(phrases.subscribtion_success, keyboards.subBack());
    } else {
      ctx.replyWithHTML(
        phrases.edit_sub_error(this.user, cost),
        keyboards.localUpBalanceMenu(),
      );
    }
  }

  private async applySubscription(
    id: number,
    num_tasks: number,
    days: number,
    price: number,
  ): Promise<any> {
    this.user = await db.getUser(id);

    let currentTimestamp = Math.floor(Date.now() / 1000);
    let timestampDate = this.calculateSubscriptionEndDate(days);

    if (this.user.subscribtionTo > currentTimestamp) {
      this.user.subscribtionTo += days * 24 * 60 * 60;
    } else {
      this.user.subscribtionTo = timestampDate;
    }

    this.user.max_tasks_num = num_tasks;
    this.user.balance = Number(this.user.balance) - price;

    await db.setUserListener(this.user);
  }

  private calculateSubscriptionEndDate(days: number): number {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return Math.floor(endDate.getTime() / 1000);
  }

  private async applyInput(ctx): Promise<void> {
    const inputText = ctx.update.message.text;
    if (inputText === PROMO_TEXT) {
      this.applySubscription(
        ctx.update.message.from.id,
        PROMO_NUM_TASKS,
        PROMO_DAYS,
        PROMO_PRICE,
      );
      return ctx.replyWithHTML(
        phrases.subscribtion_success,
        keyboards.subBack(),
      );
    } else if (isNumberWithoutSpaces(inputText) && inputText.length < 7) {
      ctx.replyWithHTML(phrases.init_pay, keyboards.initPay(Number(inputText)));
    }
  }
}
