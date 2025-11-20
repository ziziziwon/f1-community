// src/utils/useMediaCache.ts
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "media-cache";
const STORE = "images";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

export async function saveImage(id: string, file: File) {
  const db = await getDB();
  await db.put(STORE, file, id);
}

export async function loadImage(id: string): Promise<string | null> {
  const db = await getDB();
  const file = (await db.get(STORE, id)) as File | undefined;
  if (!file) return null;
  return URL.createObjectURL(file);
}

export async function deleteImage(id: string) {
  const db = await getDB();
  await db.delete(STORE, id);
}
