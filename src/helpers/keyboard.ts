import { Markup } from 'telegraf';
import { Collection, Task } from './database.js';

const keyboards: KeyboardInterface = {};
export const CALLBACK_SEPARATOR = '_!!_';

keyboards.mainMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [MainMenuButtons.SEARCH],
    [MainMenuButtons.ACCOUNT, MainMenuButtons.SUPPORT],
  ]);
};

keyboards.mainSearchMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [MainSearchButtons.START, MainSearchButtons.STOP],
    [MainSearchButtons.EDIT],
    [Back.BACK],
  ]);
};

/////////////////////

keyboards.tasksMenuToEdit = (index: number): any => {
  let inlineKeyboard = [];
  let filteredinlineKeyboard = [];

  Object.keys(TasksButtons).forEach((key: string) => {
    inlineKeyboard.push([
      {
        text: TasksButtons[key].text,
        callback_data: `${TasksButtons[key].callback_data}${CALLBACK_SEPARATOR}EDIT`,
      },
    ]);
  });

  for (let i = 0; i < index; i++) {
    filteredinlineKeyboard.push(inlineKeyboard[i]);
  }

  filteredinlineKeyboard.push([SubBack.BACK]);

  return {
    reply_markup: JSON.stringify({
      inline_keyboard: filteredinlineKeyboard,
    }) as any,
  };
};

keyboards.tasksMenu = (tasks: Collection<Task>, cond: string): any => {
  let filteredinlineKeyboard = [];

  Object.keys(TasksButtons).forEach((key: string) => {
    if (tasks[key]) {
      filteredinlineKeyboard.push([
        {
          text: TasksButtons[key].text,
          callback_data: `${TasksButtons[key].callback_data}${CALLBACK_SEPARATOR}${cond}`,
        },
      ]);
    }
  }),
    filteredinlineKeyboard.push([SubBack.BACK]);
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: filteredinlineKeyboard,
    }) as any,
  };
};

/////////////////////

keyboards.mainAccountMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [MainAccountButtons.SUBSCRIBTION],
    [MainAccountButtons.UPBALANCE],
    [
      Markup.button.url(
        MainAccountButtons.PUBLICOFFER.text,
        MainAccountButtons.PUBLICOFFER.callback_data,
      ),
    ],
    [MainAccountButtons.PROMO],
    [Back.BACK, MainAccountButtons.REFRESH],
  ]);
};

keyboards.subscribtionMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [SubscribtionButtons.SUB365],
    [SubscribtionButtons.SUB180, SubscribtionButtons.SUB30],
    [SubscribtionButtons.SUB7, SubscribtionButtons.SUB1],
    [SubBack.BACK],
  ]);
};

keyboards.upBalanceMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [
      UpBalanceButtons.PRICE150,
      UpBalanceButtons.PRICE250,
      UpBalanceButtons.PRICE500,
    ],
    [
      UpBalanceButtons.PRICE1000,
      UpBalanceButtons.PRICE2500,
      UpBalanceButtons.PRICE5000,
    ],
    [SubBack.BACK],
  ]);
};

keyboards.localUpBalanceMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [MainAccountButtons.UPBALANCE],
    [SubBack.BACK],
  ]);
};

keyboards.initPay = (price: number): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [
      {
        text: `Пополнить на ${price}₽`,
        callback_data: `SUB${CALLBACK_SEPARATOR}${price}${CALLBACK_SEPARATOR}PAY`,
      },
    ],
    [
      {
        text: 'Изменить сумму',
        callback_data: 'UPBALANCE',
      },
    ],
    [SubBack.BACK],
  ]);
};

////////////////////

keyboards.endSupportDialog = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [
      {
        text: 'Завершить диалог',
        callback_data: `END_DIALOG`,
      },
    ],
  ]);
};

keyboards.initMainMenu = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [
      {
        text: 'Главоне меню',
        callback_data: `MAIN_MENU`,
      },
    ],
  ]);
};

//////////////////

keyboards.getSupportMessages = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([
    [
      {
        text: 'Посмотреть обращения',
        callback_data: `GET_SUPPORT_MES`,
      },
    ],
    [Back.BACK],
  ]);
};

keyboards.back = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([[Back.BACK]]);
};

keyboards.subBack = (): Markup.Markup<any> => {
  return Markup.inlineKeyboard([[SubBack.BACK]]);
};

export default keyboards;

interface KeyboardInterface {
  [key: string]: any;
}

export const MainMenuButtons = {
  SEARCH: { text: '🔎 Показать комадны для поиска', callback_data: 'SEARCH' },
  ACCOUNT: { text: '⚙️ Мой аккаунт', callback_data: 'ACCOUNT' },
  SUPPORT: { text: '🆘 Поддержка', callback_data: 'SUPPORT' },
};

export const MainSearchButtons = {
  START: { text: '🏁 Начать', callback_data: 'START' },
  STOP: { text: '🏳️ Остановить', callback_data: 'STOP' },
  EDIT: { text: '⚙️ Редактировать поиск', callback_data: 'EDIT' },
};

export const TasksButtons = {
  1: { text: 'Задание 1', callback_data: 'TASK_!!_1' },
  2: { text: 'Задание 2', callback_data: 'TASK_!!_2' },
  3: { text: 'Задание 3', callback_data: 'TASK_!!_3' },
  4: { text: 'Задание 4', callback_data: 'TASK_!!_4' },
  5: { text: 'Задание 5', callback_data: 'TASK_!!_5' },
};

export const MainAccountButtons = {
  SUBSCRIBTION: {
    text: '💎 Управление подпиской',
    callback_data: 'SUBSCRIBTION',
  },
  UPBALANCE: { text: '💳 Пополнить', callback_data: 'UPBALANCE' },
  PUBLICOFFER: {
    text: '🖨️ Пользовательское соглашение',
    callback_data:
      'https://telegra.ph/Publichnaya-oferta-na-zaklyuchenie-licenzionnogo-dogovora-09-25',
  },
  REFRESH: {
    text: 'Обновить',
    callback_data: 'SUB_BACK',
  },
  PROMO: {
    text: '🛒 Ввести промокод',
    callback_data: 'PROMO',
  },
};

export const SubscribtionButtons = {
  SUB365: {
    text: '3500₽ за 365 дней',
    callback_data: `SUB_!!_365:3500_!!_EDIT`,
  },
  SUB180: {
    text: '2000₽ за 180 дней',
    callback_data: `SUB_!!_180:2000_!!_EDIT`,
  },
  SUB30: {
    text: '400₽ за 30 дней',
    callback_data: `SUB_!!_30:400_!!_EDIT`,
  },
  SUB7: {
    text: '200₽ за 7 дней',
    callback_data: `SUB_!!_7:200_!!_EDIT`,
  },
  SUB1: {
    text: '100₽ за 1 дней',
    callback_data: `SUB_!!_1:100_!!_EDIT`,
  },
};

export const UpBalanceButtons = {
  PRICE150: {
    text: '150₽',
    callback_data: `SUB_!!_150_!!_PRICE`,
  },
  PRICE250: {
    text: '250₽',
    callback_data: `SUB_!!_250_!!_PRICE`,
  },
  PRICE500: {
    text: '500₽',
    callback_data: `SUB_!!_500_!!_PRICE`,
  },
  PRICE1000: {
    text: '1000₽',
    callback_data: `SUB_!!_1000_!!_PRICE`,
  },
  PRICE2500: {
    text: '2500₽',
    callback_data: `SUB_!!_2500_!!_PRICE`,
  },
  PRICE5000: {
    text: '5000₽',
    callback_data: `SUB_!!_5000_!!_PRICE`,
  },
};

export const Back = {
  BACK: { text: '⬅️ Назад', callback_data: 'BACK' },
};

export const SubBack = {
  BACK: { text: '⟵ Назад', callback_data: 'SUB_BACK' },
};
