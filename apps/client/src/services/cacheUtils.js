import { getStore } from '@store/storeRegistry';
import { setCache, invalidateGroup } from '@store/slices/apiCacheSlice';

export const withCache = async (cacheKey, fetcher, ttl = 300000) => {
    const store = getStore();
    if (store) {
        const cachedItem = store.getState().apiCache[cacheKey];
        if (cachedItem && (Date.now() - cachedItem.timestamp < ttl)) {
            return { data: cachedItem.data }; // Simulate axios response structure
        }
    }
    const res = await fetcher();
    if (store && res.data) {
        store.dispatch(setCache({ key: cacheKey, data: res.data }));
    }
    return res;
};

export const invalidateCache = (prefix) => {
    const store = getStore();
    if (store) store.dispatch(invalidateGroup(prefix));
};
