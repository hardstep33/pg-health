import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs: number): Promise<T> {
    const now = Date.now();
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > now) {
      return entry.value;
    }
    const value = await fetcher();
    this.cache.set(key, { value, expiresAt: now + ttlMs });
    return value;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}