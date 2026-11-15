// In-memory TTL cache for server components & APIs to avoid latency
type CacheEntry<T> = {
  data: T
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = memoryCache.get(key)
  const now = Date.now()
  if (existing && now - existing.timestamp < ttlMs) {
    return existing.data as T
  }

  try {
    const fresh = await fetcher()
    memoryCache.set(key, { data: fresh, timestamp: now })
    return fresh
  } catch (error) {
    // If fresh fetch fails but we have stale cache, return stale cache as graceful fallback
    if (existing) {
      return existing.data as T
    }
    throw error
  }
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear()
    return
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
}
