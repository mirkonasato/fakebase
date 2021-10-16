import { readFile, rm } from 'fs/promises';
import tmp from 'tmp';
import { Database, Entity, Table } from '../dist';

interface Apple extends Entity {
  variety: string;
  weight: number;
}

let db: Database;

beforeEach(async () => {
  const dir = tmp.dirSync({ unsafeCleanup: true });
  db = new Database(dir.name);
});

test('empty table', async () => {
  const Apple = db.table<Apple>('apples');
  await verifyTable(Apple, []);
});

test('create one', async () => {
  const Apple = db.table<Apple>('apples');
  const a = await Apple.create({ variety: 'Akane', weight: 101 });
  expect(a.id).toMatch(/[A-Za-z0-9_-]+/);
  expect(a.variety).toBe('Akane');
  expect(a.weight).toBe(101);
});

test('create many', async () => {
  const Apple = db.table<Apple>('apples');
  const a = await Apple.create({ variety: 'Akane', weight: 101 });
  const b = await Apple.create({ variety: 'Braeburn', weight: 102 });
  const c = await Apple.create({ variety: 'Cox', weight: 103 });
  await verifyTable(Apple, [a, b, c]);
});

test('find by id', async () => {
  const Apple = db.table<Apple>('apples');
  await Apple.create({ variety: 'Akane', weight: 101 });
  const b = await Apple.create({ variety: 'Braeburn', weight: 102 });
  await Apple.create({ variety: 'Cox', weight: 103 });
  const record = await Apple.findById(b.id);
  expect(record).toEqual(b);
});

test('find all with predicate', async () => {
  const Apple = db.table<Apple>('apples');
  const a = await Apple.create({ variety: 'Akane', weight: 101 });
  const b1 = await Apple.create({ variety: 'Braeburn', weight: 102 });
  const b2 = await Apple.create({ variety: 'Braeburn', weight: 103 });
  const records = await Apple.findAll((apple) => apple.variety === 'Braeburn');
  expect(records).toEqual([b1, b2]);
});

test('find one with predicate', async () => {
  const Apple = db.table<Apple>('apples');
  const a = await Apple.create({ variety: 'Akane', weight: 101 });
  const b1 = await Apple.create({ variety: 'Braeburn', weight: 102 });
  const b2 = await Apple.create({ variety: 'Braeburn', weight: 103 });
  const record = await Apple.findOne((apple) => apple.variety === 'Braeburn');
  expect(record).toEqual(b1);
});

test('update', async () => {
  const Apple = db.table<Apple>('apples');
  const a = await Apple.create({ variety: 'Akane', weight: 101 });
  const b = await Apple.create({ variety: 'Braeburn', weight: 102 });
  const c = await Apple.create({ variety: 'Cox', weight: 103 });
  const b2 = await Apple.update({ id: b.id, variety: 'Braeburn2', weight: 122 });
  expect(b2).toEqual({ id: b.id, variety: 'Braeburn2', weight: 122 });
  await verifyTable(Apple, [a, b2, c]);
});

test('delete', async () => {
  const Apple = db.table<Apple>('apples');
  const a = await Apple.create({ variety: 'Akane', weight: 101 });
  const b = await Apple.create({ variety: 'Braeburn', weight: 102 });
  const c = await Apple.create({ variety: 'Cox', weight: 103 });
  const b2 = await Apple.delete(b.id);
  expect(b2).toEqual(b);
  await verifyTable(Apple, [a, c]);
});

test('create database dir if required', async () => {
  const dir = tmp.tmpNameSync();
  try {    
    const db = new Database(dir);
    const apples = db.table<Apple>('apples');
    await apples.findAll();
  } finally {
    rm(dir, { force: true, recursive: true });
  }
});

async function verifyTable(table: Table<any>, expectedRecords: any[]) {
  const records = await table.findAll();
  expect(records).toEqual(expectedRecords);
  // make sure changes have been persisted
  const data = await readFile((table as any).file, 'utf8');
  expect(JSON.parse(data)).toEqual(expectedRecords);
}
