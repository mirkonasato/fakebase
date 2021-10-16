import { nanoid } from 'nanoid';
import { Entity } from './Entity';
import { readOrCreateJson, writeJson } from './files';

export class Table<T extends Entity> {
  private records: T[] | undefined;

  constructor(private name: string, private file: string) { }

  /**
   * Inserts a new record.
   * @param recordData an object containing all record properties but without id.
   * that will be auto-generated.
   * @returns the new record, with an auto-generated `id`.
   */
  async create(recordData: Omit<T, 'id'>): Promise<T> {
    return this.mutate((records) => {
      const id = nanoid();
      const record = { id, ...recordData } as T;
      records.push(record);
      return record;
    });
  }

  /**
   * Deletes the record with the given id.
   * @param id the record id.
   * @returns the deleted record.
   */
  async delete(id: string): Promise<T> {
    return this.mutate((records) => {
      const index = this.findIndex(records, id);
      const [record] = records.splice(index, 1);
      return record;  
    });
  }

  /**
   * Finds an record by its id.
   * @param id the record id.
   * @returns the record with the given id, or `undefined` if not found.
   */
  findById(id: string): Promise<T | undefined> {
    return this.findOne((record) => record.id === id);
  }

  /**
   * Finds the first record matching the given predicate.
   * @param predicate a predicate function, returning `true` for the desired
   * record and `false` otherwise.
   * @returns the record, or `undefined` if not found.
   */
  async findOne(predicate: (record: T) => boolean): Promise<T | undefined> {
    const records = await this.getRecords();
    return records.find(predicate);
  }

  /**
   * Finds all records, or only those matching the given `predicate`.
   * @param predicate an optional predicate function, returning `true` for the
   * records that should be included and `false` otherwise.
   * @returns the record, or `undefined` if not found.
   */
  async findAll(predicate?: (record: T) => boolean): Promise<T[]> {
    const records = await this.getRecords();
    if (predicate) {
      return records.filter(predicate);
    }
    return records;
  }

  /**
   * Updates a record, replacing the one with the same `id`.
   * @param record the modified object.
   * @returns the modified object.
   */
  async update(record: T): Promise<T> {
    return this.mutate((records) => {
      const index = this.findIndex(records, record.id);
      records[index] = record;
      return record;  
    });
  }

  private async getRecords(): Promise<T[]> {
    if (this.records === undefined) {
      this.records = await readOrCreateJson<T[]>(this.file, []);
    }
    return this.records;
  }

  private findIndex(records: T[], id: string): number {
    const index = records.findIndex((current) => current.id === id);
    if (index === -1) {
      throw new Error(`No ${this.name} found with id='${id}'`);
    }
    return index;
  }

  private async mutate(operation: (records: T[]) => T): Promise<T> {
    const records = await this.getRecords();
    const record = operation(records);
    await writeJson(this.file, records);
    return record;
  }
}
