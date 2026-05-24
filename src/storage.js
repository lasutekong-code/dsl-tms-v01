const STORAGE_PREFIX = "dsl-tms";

function buildKey(moduleId) {
  return `${STORAGE_PREFIX}:${moduleId}`;
}

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    }
  };
}

function getDefaultStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return createMemoryStorage();
}

export function readRecords(moduleId, storage = getDefaultStorage()) {
  const rawValue = storage.getItem(buildKey(moduleId));

  if (!rawValue) {
    return [];
  }

  try {
    const records = JSON.parse(rawValue);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function writeRecords(moduleId, records, storage = getDefaultStorage()) {
  storage.setItem(buildKey(moduleId), JSON.stringify(records));
}

export function addRecord(moduleId, payload, storage = getDefaultStorage()) {
  const records = readRecords(moduleId, storage);
  const record = {
    id: `${moduleId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...payload
  };

  records.unshift(record);
  writeRecords(moduleId, records, storage);

  return record;
}

export function deleteRecord(moduleId, recordId, storage = getDefaultStorage()) {
  const records = readRecords(moduleId, storage);
  const nextRecords = records.filter((record) => record.id !== recordId);
  writeRecords(moduleId, nextRecords, storage);
  return nextRecords;
}

export function createTestStorage() {
  return createMemoryStorage();
}
