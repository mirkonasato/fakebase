import { resolve } from 'path';
import { Entity } from './Entity';
import { Table } from './Table';

export class Database {
  private static tableByFile: { [file: string]: Table<any> } = {};

  /**
   * Creates a database using files inside the given `dir`.
   * @param dir path to a local folder where to store the database files.
   */
  constructor(private dir: string) { }

  /**
   * Creates or obtains the {@link Table} with the given `name`.
   * @param name a unique table name.
   * @returns a `Table` instance.
   */
  table<T extends Entity>(name: string): Table<T> {
    const file = resolve(this.dir, `${name}.json`);
    if (file in Database.tableByFile) {
      // ensure there is a single Table instance writing to the given file
      return Database.tableByFile[file] as Table<T>;
    }
    const table = new Table<T>(this.dir, file);
    Database.tableByFile[file] = table;
    return table;
  }
}
