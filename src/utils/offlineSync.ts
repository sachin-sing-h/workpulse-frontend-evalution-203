import { openDB, IDBPDatabase } from 'idb';
import { Activity } from '../types';

const DB_NAME = 'WorkPulseOffline';
const STORE_NAME = 'activities';

let dbPromise: Promise<IDBPDatabase>;

export const initSyncDB = () => {
  dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'client_activity_id' });
      }
    },
  });
};

export const offlineStorage = {
  saveActivity: async (activity: Activity) => {
    const db = await dbPromise;
    await db.put(STORE_NAME, activity);
  },

  getAllActivities: async () => {
    const db = await dbPromise;
    return db.getAll(STORE_NAME) as Promise<Activity[]>;
  },

  clearActivities: async (ids: string[]) => {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const id of ids) {
      await tx.store.delete(id);
    }
    await tx.done;
  },
};
