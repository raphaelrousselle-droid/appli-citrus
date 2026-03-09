import { openDB } from 'idb';

const DB_NAME = 'citrus-tracker';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Table des plants
      if (!db.objectStoreNames.contains('plants')) {
        const plantStore = db.createObjectStore('plants', { keyPath: 'id' });
        plantStore.createIndex('position', 'position');
      }
      // Journal des soins
      if (!db.objectStoreNames.contains('care_logs')) {
        const careStore = db.createObjectStore('care_logs', { keyPath: 'id', autoIncrement: true });
        careStore.createIndex('plantId', 'plantId');
      }
      // Rappels/notifications
      if (!db.objectStoreNames.contains('reminders')) {
        db.createObjectStore('reminders', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// PLANTS
export const getAllPlants = async () => {
  const db = await initDB();
  return db.getAll('plants');
};

export const savePlant = async (plant) => {
  const db = await initDB();
  if (!plant.id) plant.id = crypto.randomUUID();
  await db.put('plants', plant);
  return plant;
};

export const deletePlant = async (id) => {
  const db = await initDB();
  await db.delete('plants', id);
};

// SOINS
export const getCareLogsForPlant = async (plantId) => {
  const db = await initDB();
  return db.getAllFromIndex('care_logs', 'plantId', plantId);
};

export const saveCareLog = async (log) => {
  const db = await initDB();
  log.date = log.date || new Date().toISOString();
  await db.add('care_logs', log);
};
