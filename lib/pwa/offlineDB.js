import { openDB } from 'idb';

const DB_NAME = 'verdant-offline-store';
const DB_VERSION = 1;

/**
 * Initializes and upgrades the IndexedDB database.
 */
export async function getDB() {
  if (typeof window === 'undefined') return null;

  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Recently viewed jobs store
      if (!db.objectStoreNames.contains('recentJobs')) {
        const jobsStore = db.createObjectStore('recentJobs', { keyPath: '_id' });
        jobsStore.createIndex('timestamp', 'timestamp');
        jobsStore.createIndex('title', 'title');
      }

      // 2. Offline actions queue (bookmarking, notes, drafts)
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncStore.createIndex('timestamp', 'timestamp');
        syncStore.createIndex('type', 'type');
      }

      // 3. Generic offline key-value cache
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    },
  });
}

/**
 * Save or update a viewed job into offline storage.
 * Keeps at most 30 recent jobs to optimize storage.
 */
export async function saveRecentJob(job) {
  try {
    const db = await getDB();
    if (!db || !job || !job._id) return;

    const entry = {
      ...job,
      _id: String(job._id),
      timestamp: Date.now(),
    };

    await db.put('recentJobs', entry);

    // Prune older entries if > 30
    const tx = db.transaction('recentJobs', 'readwrite');
    const store = tx.objectStore('recentJobs');
    const index = store.index('timestamp');
    let cursor = await index.openCursor(null, 'prev');
    let count = 0;
    while (cursor) {
      count++;
      if (count > 30) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  } catch (err) {
    console.warn('Error saving recent job to IndexedDB:', err);
  }
}

/**
 * Get all cached recent jobs sorted by most recently viewed.
 */
export async function getRecentJobs(limit = 10) {
  try {
    const db = await getDB();
    if (!db) return [];

    const tx = db.transaction('recentJobs', 'readonly');
    const index = tx.objectStore('recentJobs').index('timestamp');
    let cursor = await index.openCursor(null, 'prev');
    const jobs = [];

    while (cursor && jobs.length < limit) {
      jobs.push(cursor.value);
      cursor = await cursor.continue();
    }
    return jobs;
  } catch (err) {
    console.warn('Error reading recent jobs from IndexedDB:', err);
    return [];
  }
}

/**
 * Queue an action while offline to replay when back online.
 */
export async function queueAction(action) {
  try {
    const db = await getDB();
    if (!db) return;

    await db.add('syncQueue', {
      ...action,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Error queueing offline action:', err);
  }
}

/**
 * Retrieve all pending sync queue actions.
 */
export async function getQueuedActions() {
  try {
    const db = await getDB();
    if (!db) return [];

    return await db.getAll('syncQueue');
  } catch (err) {
    console.warn('Error fetching sync queue:', err);
    return [];
  }
}

/**
 * Remove a processed sync action by ID.
 */
export async function removeQueuedAction(id) {
  try {
    const db = await getDB();
    if (!db) return;

    await db.delete('syncQueue', id);
  } catch (err) {
    console.warn('Error removing queued action:', err);
  }
}

/**
 * Clear all private offline data (e.g. on user logout).
 */
export async function clearOfflineData() {
  try {
    const db = await getDB();
    if (!db) return;

    const tx = db.transaction(['recentJobs', 'syncQueue', 'offlineData'], 'readwrite');
    await Promise.all([
      tx.objectStore('recentJobs').clear(),
      tx.objectStore('syncQueue').clear(),
      tx.objectStore('offlineData').clear(),
    ]);
  } catch (err) {
    console.warn('Error clearing offline IndexedDB:', err);
  }
}
