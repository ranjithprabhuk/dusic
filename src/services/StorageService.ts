import { openDB, type IDBPDatabase } from 'idb';

interface StoredComposition {
  id: string;
  name: string;
  bpm: number;
  tracks: unknown[];
  savedAt: string;
}

const DB_NAME = 'dusic-db';
const STORE_NAME = 'compositions';
const DB_VERSION = 1;

class StorageService {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private getDb(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async save(composition: { name: string; bpm: number; tracks: unknown[] }): Promise<string> {
    const db = await this.getDb();
    const id = `comp-${Date.now()}`;
    const record: StoredComposition = {
      id,
      name: composition.name,
      bpm: composition.bpm,
      tracks: JSON.parse(JSON.stringify(composition.tracks)),
      savedAt: new Date().toISOString(),
    };

    try {
      await db.put(STORE_NAME, record);
      return id;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Delete some compositions to free space.');
      }
      throw err;
    }
  }

  async update(id: string, composition: { name: string; bpm: number; tracks: unknown[] }): Promise<void> {
    const db = await this.getDb();
    const record: StoredComposition = {
      id,
      name: composition.name,
      bpm: composition.bpm,
      tracks: JSON.parse(JSON.stringify(composition.tracks)),
      savedAt: new Date().toISOString(),
    };
    await db.put(STORE_NAME, record);
  }

  async load(id: string): Promise<StoredComposition | undefined> {
    const db = await this.getDb();
    return db.get(STORE_NAME, id);
  }

  async listAll(): Promise<StoredComposition[]> {
    const db = await this.getDb();
    const all = await db.getAll(STORE_NAME);
    return all.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(STORE_NAME, id);
  }
}

export const storageService = new StorageService();
