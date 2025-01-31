import { Ad, Collection } from './database.js';

export function pause(val = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, val);
  });
}

export function compareCollections(
  old: Collection<Ad>,
  updates: Collection<Ad>,
): string[] {
  return Object.keys(updates).filter((key: string) => !old[key]);
}

export function formatTimestamp(timestamp: number, isSubDate: boolean): string {
  const date = new Date(timestamp * 1000); // Преобразуем Unix timestamp в миллисекунды
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getUTCFullYear();

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (isSubDate) {
    return `${day}.${month}.${year}`;
  }
  return `${day}.${month}.${year} (${diffDays} дней)`;
}

export function isNumberWithoutSpaces(text: string): boolean {
  return /^\d+$/.test(text);
}
