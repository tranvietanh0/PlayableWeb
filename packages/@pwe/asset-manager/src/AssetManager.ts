export type AssetType = 'image' | 'json' | 'audio' | 'text' | 'binary';

export interface AssetEntry<T = unknown> {
  key: string;
  url: string;
  type: AssetType;
  data?: T;
  error?: Error;
  refCount: number;
  loading: boolean;
  loaded: boolean;
}

export interface LoadProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
}

export type AssetLoader<T = unknown> = (url: string) => Promise<T>;

export class AssetManager {
  private _assets = new Map<string, AssetEntry>();
  private _loaders = new Map<AssetType, AssetLoader>();
  private _defaultLoaders: Record<AssetType, AssetLoader> = {
    image: (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      }),
    json: (url) => fetch(url).then((r) => r.json()),
    audio: (url) => fetch(url).then((r) => r.blob()),
    text: (url) => fetch(url).then((r) => r.text()),
    binary: (url) => fetch(url).then((r) => r.arrayBuffer()),
  };

  constructor() {
    for (const [type, loader] of Object.entries(this._defaultLoaders)) {
      this._loaders.set(type as AssetType, loader);
    }
  }

  registerLoader(type: AssetType, loader: AssetLoader): void {
    this._loaders.set(type, loader);
  }

  load<T = unknown>(key: string, url: string, type: AssetType): Promise<T> {
    const existing = this._assets.get(key);
    if (existing) {
      if (existing.loaded) {
        existing.refCount++;
        return Promise.resolve(existing.data as T);
      }
      if (existing.loading) {
        return this._waitForLoad<T>(key);
      }
    }

    const entry: AssetEntry = {
      key,
      url,
      type,
      refCount: 1,
      loading: true,
      loaded: false,
    };
    this._assets.set(key, entry);

    const loader = this._loaders.get(type);
    if (!loader) {
      const err = new Error(`No loader registered for type: ${type}`);
      entry.error = err;
      entry.loading = false;
      return Promise.reject(err);
    }

    return loader(url)
      .then((data) => {
        entry.data = data;
        entry.loaded = true;
        entry.loading = false;
        return data as T;
      })
      .catch((err) => {
        entry.error = err instanceof Error ? err : new Error(String(err));
        entry.loading = false;
        throw entry.error;
      });
  }

  loadBatch(
    items: Array<{ key: string; url: string; type: AssetType }>
  ): Promise<LoadProgress> {
    const progress: LoadProgress = {
      total: items.length,
      completed: 0,
      failed: 0,
      percentage: 0,
    };

    const promises = items.map((item) =>
      this.load(item.key, item.url, item.type)
        .then(() => {
          progress.completed++;
          progress.percentage = Math.round(
            ((progress.completed + progress.failed) / progress.total) * 100
          );
        })
        .catch(() => {
          progress.failed++;
          progress.percentage = Math.round(
            ((progress.completed + progress.failed) / progress.total) * 100
          );
        })
    );

    return Promise.all(promises).then(() => progress);
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this._assets.get(key);
    return entry?.loaded ? (entry.data as T) : undefined;
  }

  has(key: string): boolean {
    const entry = this._assets.get(key);
    return entry?.loaded ?? false;
  }

  isLoading(key: string): boolean {
    return this._assets.get(key)?.loading ?? false;
  }

  release(key: string): void {
    const entry = this._assets.get(key);
    if (!entry) return;
    entry.refCount--;
    if (entry.refCount <= 0) {
      this._assets.delete(key);
    }
  }

  unload(key: string): void {
    this._assets.delete(key);
  }

  unloadAll(): void {
    this._assets.clear();
  }

  getProgress(): LoadProgress {
    const entries = Array.from(this._assets.values());
    const total = entries.length;
    const completed = entries.filter((e) => e.loaded).length;
    const failed = entries.filter((e) => e.error).length;
    return {
      total,
      completed,
      failed,
      percentage: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0,
    };
  }

  getKeys(): string[] {
    return Array.from(this._assets.keys());
  }

  private _waitForLoad<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const check = () => {
        const entry = this._assets.get(key);
        if (!entry) {
          reject(new Error(`Asset ${key} was removed during load`));
          return;
        }
        if (entry.loaded) {
          entry.refCount++;
          resolve(entry.data as T);
          return;
        }
        if (entry.error) {
          reject(entry.error);
          return;
        }
        setTimeout(check, 10);
      };
      check();
    });
  }
}
