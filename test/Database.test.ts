import tmp from 'tmp';
import { Database } from '../dist/';

test('single table instance per file', async () => {
  const dir = tmp.dirSync({ unsafeCleanup: true });
  const db1 = new Database(dir.name);
  const apples1 = db1.table('apples');
  const db2 = new Database(dir.name);
  const apples2 = db2.table('apples');
  expect(apples2).toBe(apples1);  
});
