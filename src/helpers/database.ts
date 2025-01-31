import { conf } from '../../config.js';
import { createClient } from '@supabase/supabase-js';

class DatabaseService {
  db: any;

  constructor() {
    this.db = createClient(conf.supabase.databaseURL, conf.supabase.apiKey);
    console.log('Инициализировано');
  }

  async setUserListener(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db
        .from('users')
        .upsert(user)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  getUser(id: number): Promise<User> {
    return new Promise((resolve, reject) => {
      this.db
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
        .then((snapshot) => resolve(snapshot.data))
        .catch((err) => reject(err));
    });
  }

  getTasks(id: number): Promise<Collection<Task>> {
    return new Promise((resolve, reject) => {
      this.db
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
        .then((snapshot) => resolve(snapshot.data.tasks))
        .catch((err) => reject(err));
    });
  }

  editTask(id: number, ts: Collection<Task>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db
        .from('users')
        .update({ tasks: ts })
        .eq('id', id)
        .then(() => resolve(''))
        .catch((err) => reject(err));
    });
  }

  getSaveAds(user: User): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        .then((snapshot) => {
          resolve(snapshot.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  setNewAds(user: User, id: number, ad: Collection<Ad>): Promise<any> {
    return new Promise((resolve, reject) => {
      let path = {};
      path[`ads_${id}`] = ad;
      this.db
        .from('users')
        .update(path)
        .eq('id', user.id)
        .then(() => resolve(''))
        .catch((err) => reject(err));
    });
  }
}

const db = new DatabaseService();
export default db;

export interface User {
  id: number;
  balance: number;
  created_at: number;
  subscribtionTo: number;
  tasks: Collection<Task>;
  max_tasks_num: number;
  ads_1: Collection<Ad>;
  ads_2: Collection<Ad>;
  ads_3: Collection<Ad>;
}

export interface Collection<T> {
  [key: string]: T;
}

export interface Ad {
  title: string;
  id: string;
  price: number;
  url: string;
  description: string;
  date: string;
}

export interface Task {
  cron: string;
  query: string;
  dostavka: string;
  city: string;
  is_Active: boolean;
  price_From: string;
  price_To: string;
  id: number;
}
