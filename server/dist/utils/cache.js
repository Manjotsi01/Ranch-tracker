"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAll = exports.invalidate = exports.cached = void 0;
const store = new Map();
const cached = async (key, ttlMs, fn) => {
    const hit = store.get(key);
    if (hit && hit.expiresAt > Date.now()) {
        return hit.data;
    }
    const data = await fn();
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
};
exports.cached = cached;
const invalidate = (prefix) => {
    for (const key of store.keys()) {
        if (key.startsWith(prefix))
            store.delete(key);
    }
};
exports.invalidate = invalidate;
const clearAll = () => store.clear();
exports.clearAll = clearAll;
