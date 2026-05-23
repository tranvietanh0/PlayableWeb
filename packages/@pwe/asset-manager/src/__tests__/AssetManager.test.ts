import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssetManager } from '../index.js';

describe('AssetManager', () => {
  let manager: AssetManager;

  beforeEach(() => {
    manager = new AssetManager();
  });

  it('loads and retrieves a text asset', async () => {
    const loader = vi.fn().mockResolvedValue('hello world');
    manager.registerLoader('text', loader);

    const data = await manager.load('greeting', 'http://example.com/hello.txt', 'text');
    expect(data).toBe('hello world');
    expect(manager.get('greeting')).toBe('hello world');
    expect(manager.has('greeting')).toBe(true);
  });

  it('loads and retrieves a JSON asset', async () => {
    const loader = vi.fn().mockResolvedValue({ name: 'test' });
    manager.registerLoader('json', loader);

    const data = await manager.load('config', 'http://example.com/config.json', 'json');
    expect(data).toEqual({ name: 'test' });
    expect(manager.get('config')).toEqual({ name: 'test' });
  });

  it('reuses cached asset on second load', async () => {
    const loader = vi.fn().mockResolvedValue('data');
    manager.registerLoader('text', loader);

    await manager.load('key1', 'http://example.com/data.txt', 'text');
    await manager.load('key1', 'http://example.com/data.txt', 'text');

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('increments refCount on cached load', async () => {
    const loader = vi.fn().mockResolvedValue('data');
    manager.registerLoader('text', loader);

    await manager.load('key1', 'http://example.com/data.txt', 'text');
    await manager.load('key1', 'http://example.com/data.txt', 'text');

    manager.release('key1');
    expect(manager.has('key1')).toBe(true);
    manager.release('key1');
    expect(manager.has('key1')).toBe(false);
  });

  it('handles load errors', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Network error'));
    manager.registerLoader('text', loader);

    await expect(manager.load('bad', 'http://example.com/bad.txt', 'text')).rejects.toThrow('Network error');
    expect(manager.has('bad')).toBe(false);
  });

  it('reports loading state', async () => {
    const loader = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('done'), 50)));
    manager.registerLoader('text', loader);

    const promise = manager.load('slow', 'http://example.com/slow.txt', 'text');
    expect(manager.isLoading('slow')).toBe(true);

    await promise;
    expect(manager.isLoading('slow')).toBe(false);
  });

  it('loads a batch of assets', async () => {
    const loader = vi.fn().mockResolvedValue('data');
    manager.registerLoader('text', loader);
    manager.registerLoader('json', loader);

    const progress = await manager.loadBatch([
      { key: 'a', url: 'http://example.com/a.txt', type: 'text' },
      { key: 'b', url: 'http://example.com/b.json', type: 'json' },
    ]);

    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(2);
    expect(progress.failed).toBe(0);
    expect(progress.percentage).toBe(100);
  });

  it('reports batch progress with failures', async () => {
    const goodLoader = vi.fn().mockResolvedValue('data');
    const badLoader = vi.fn().mockRejectedValue(new Error('fail'));
    manager.registerLoader('text', goodLoader);
    manager.registerLoader('json', badLoader);

    const progress = await manager.loadBatch([
      { key: 'a', url: 'http://example.com/a.txt', type: 'text' },
      { key: 'b', url: 'http://example.com/b.json', type: 'json' },
    ]);

    expect(progress.completed).toBe(1);
    expect(progress.failed).toBe(1);
    expect(progress.percentage).toBe(100);
  });

  it('unloads an asset', async () => {
    const loader = vi.fn().mockResolvedValue('data');
    manager.registerLoader('text', loader);

    await manager.load('key', 'http://example.com/data.txt', 'text');
    expect(manager.has('key')).toBe(true);

    manager.unload('key');
    expect(manager.has('key')).toBe(false);
  });

  it('unloads all assets', async () => {
    const loader = vi.fn().mockResolvedValue('data');
    manager.registerLoader('text', loader);

    await manager.load('a', 'http://example.com/a.txt', 'text');
    await manager.load('b', 'http://example.com/b.txt', 'text');

    manager.unloadAll();
    expect(manager.has('a')).toBe(false);
    expect(manager.has('b')).toBe(false);
    expect(manager.getKeys()).toEqual([]);
  });

  it('returns undefined for missing asset', () => {
    expect(manager.get('missing')).toBeUndefined();
    expect(manager.has('missing')).toBe(false);
  });

  it('reports overall progress', async () => {
    const loader = vi.fn().mockResolvedValue('data');
    manager.registerLoader('text', loader);

    await manager.load('a', 'http://example.com/a.txt', 'text');
    const progress = manager.getProgress();
    expect(progress.total).toBe(1);
    expect(progress.completed).toBe(1);
    expect(progress.percentage).toBe(100);
  });

  it('throws when no loader is registered', async () => {
    manager = new AssetManager();
    // Remove default loaders
    // @ts-expect-error private field
    manager._loaders.clear();

    await expect(manager.load('x', 'url', 'text')).rejects.toThrow('No loader registered');
  });
});
