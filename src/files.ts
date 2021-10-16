import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname } from 'path';

export async function createParentDir(file: string): Promise<void> {
  const dir = dirname(file);
  try {
    const stats = await stat(dir);
    if (!stats.isDirectory()) {
      throw new Error(`Path exists but is not a directory: '${dir}'`);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await mkdir(dir, { recursive: true });
    } else {
      throw err;
    }
  }
}

export async function readOrCreateJson<T>(file: string, defaultValue: T): Promise<T> {
  try {
    const data = await readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await createParentDir(file);
      await writeJson(file, defaultValue);
      return defaultValue;
    }
    throw err;
  }
}

export function writeJson<T>(file: string, value: T): Promise<void> {
  const data = JSON.stringify(value, null, 2);
  return writeFile(file, data, 'utf8');
}
