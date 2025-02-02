import { cities } from './cities.js';
import { Collection, Task, User } from './database.js';
import { formatTimestamp } from './utils.js';

export const phrases = {
  main: `Откройте мир возможностей с нами — мы анализируем все новые объявления Авито, что есть в России, превращая их в ценные знания для экспериментов и поиска.\n\n<strong>Выберите нужное действие:</strong>`,
  search_main: `<strong>Главная страница объявлений</strong>\n\nВыберете пункт меню:`,

  search_start_stop_main: (cond: string) =>
    `<strong>Доступные объявления для поиска</strong>\n\nВыберете нужное задание для ${cond === 'START' ? 'старта' : 'паузы'}:`,

  search_start_stop_main_error: (cond: string) =>
    `<strong>Доступные объявления для поиска</strong>\n\n⚠️ Нет заданий для ${cond === 'START' ? 'старта' : 'паузы'}:`,

  tasks_edit_main: `<strong>Редактирование поиска объявлений</strong>\n\nВыберете нужное задание:`,
  task_edit: `⬇️ <strong>Примеры команд для ввода:</strong>
  ├ Название объявления: iphone 16 pro max 256gb
  ├ Город: Москва и МО
  ├ Авито доставка: да
  ├ Цена от: 75000
  └ Цена до: 150000

Для поиска по Москве и МО, введите - Москва и МО, по Санкт-Петербургу и ЛО - Санкт-Петербург и ЛО, все регионы - Россия.

<strong>Пожалуйста, введите название объявления:</strong>\n`,

  steps: [
    'Пожалуйста, введите город:',
    'С авито доставкой?',
    'Цена от:',
    'Цена до:',
  ],

  support_main: `✅ <strong>Чат с поддержкой установлен</strong>\n
Переходите сразу <strong>к сути дела в обращении за помощью,</strong> стараясь максимально осветить проблему. 
Таким образом мы сможем быстро дать ответ и решить Вашу проблему. Мы постараемся помочь как можно быстрее, но ожидание может занять время.

<strong>График работы:</strong> 09:00-23:00 по Москве.

<strong>Пожалуйста, напишите вашу проблему:</strong>`,

  support_end: `<strong>💬 Вы покинули чат с поддержкой</strong>`,
  support_messege_send: `<strong>Ваше сообщение отправлено</strong>. 
Мы постараемся ответить как можно скорее.`,
  support_messege_error: `<strong>Ваше сообщение не отправлено</strong>. 
Пожалуйста, дождитесь ответа на обращение.`,

  success: '😎 Успех!',
  error: `<strong>⚠️ Ошибка!</strong>
  Пожалуйста, повторите значение`,

  admin_main: 'Главное меню Админа',

  account_main: (user: User): string => `<strong>Мой аккаунт</strong>
<em>Вся необходимая информация о вашем профиле</em>
  <strong>
👁‍🗨 ID: <code>${user.id}</code>
👁‍🗨 Регистрация: <code>${formatTimestamp(user.created_at, false)}</code>

💶 Мой кошелёк: <code>${Number(user.balance)}₽</code>
💎 Подписка до: <code>${user.subscribtionTo < Math.floor(Date.now() / 1000) ? 'отсутствует' : formatTimestamp(user.subscribtionTo, true)}</code>
Лимит запросов в сутки:

${showAllTasks(user.tasks)}</strong>`,

  subscribrion_main: `<strong>Подписка</strong> — открывает безлимитный доступ к найденной информации, увеличивает лимит поисковых запросов до 3.`,
  subscribtion_success: `<strong>😎 Успех!</strong>
  Подписка была успешно оформлена.`,

  promo_main: `<strong>Активировать купон</strong>
У вас есть код купона ?

Введите код купона:`,

  edit_sub_error: (
    user: User,
    price: number,
  ): string => `<strong>🛑 Недостаточно средств для оплаты.</strong>

<strong>В данный момент ваш баланс:</strong> <code>${user.balance}₽</code>
<strong>Необходимо: </strong> <code>${price}₽</code>

Пополните баланс и повторите попытку.`,

  up_balance_main: `<strong>Введите сумму на которую хотите пополнить Ваш баланс или выберете из предложенных:</strong>`,

  init_pay: `<strong>💳 Для пополнения баланса нажмите кнопку ниже:</strong>`,
};

function getCityKey(value: string): string | undefined {
  const formattedValue = value.replace(/_/g, ' ');
  const entry = Object.entries(cities).find(
    ([_key, val]) => val === formattedValue,
  );
  return entry ? entry[0] : undefined;
}

function showAllTasks(tasks: Collection<Task>): string[] {
  const textArray = [];
  if (!tasks) {
    return [];
  }
  const taskArray = Object.values(tasks);
  for (const t of taskArray) {
    let text = `🔎 Мое текущее задание ${t.id}:
├ Название объявления: <code>${t.query.replace(/\+/g, ' ')}</code>
├ Город: <code>${getCityKey(t.city)}</code>
├ Авито доставка: <code>${t.dostavka ? 'да' : 'нет'}</code>
├ Цена от: <code>${t.price_From}</code>
├ Цена до: <code>${t.price_To}</code>
└ Статус: <code>${t.is_Active ? 'работает' : 'остановлен'}</code>\n
`;
    textArray.push(text);
  }
  return textArray;
}
