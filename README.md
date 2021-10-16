# Fakebase

A "fake" database for Node.js that stores data in local JSON files, for testing
and sample applications.

## Installation

```
npm install fakebase
```

## Usage

Create a `Database` instance specifying in which folder to store the data, then
create a `Table` for each type you want to store:

```js
import { Database } from 'fakebase';

const db = new Database('./data/');
const Apple = db.table('apples');
const Orange = db.table('oranges');
```

This will save apples in `./data/apples.json` and oranges in
`./data/oranges.json`.

You can then manipulate each table using the following CRUD operations:

```js
// create a new record: returns an object with an auto-generated id
const newApple = await Apple.create({ variety: 'Gala', weight: 133 });
// => newApple: { id: 'oY6H7nWVxaT60WJV3iN7M', variety: 'Gala', weight: 133 }

// get all records as an array
const apples = await Apple.findAll();
// => apples: [{ id: 'oY6H7nWVxaT60WJV3iN7M', variety: 'Gala', weight: 133 }]

// find a record by id
const oldApple = await Apple.findById('oY6H7nWVxaT60WJV3iN7M');
// => oldApple: { id: 'oY6H7nWVxaT60WJV3iN7M', variety: 'Gala', weight: 133 }

// update a record
await Apple.update({ id: 'oY6H7nWVxaT60WJV3iN7M', variety: 'Braeburn', weight: 133 });

// delete a record by id
await Apple.delete('oY6H7nWVxaT60WJV3iN7M');

// find the first record matching a predicate function
const bigApple = await Apple.findOne((apple) => apple.weight > 200);

// find all records matching a predicate function
const galaApples = await Apple.findAll((apple) => apple.variety === 'Gala');
```

That's it. All operations are asynchronous.

JSON files are read once at startup and written after each modification. The
assumption is that the Node.js app using Fakebase is the only process modifying
those files.

You can manually edit the JSON files to provide some initial data, as long as
you do that before starting the application. External changes made while the app
is running will not be detected, and will be overwritten if any of
`create`/`update`/`delete` is called.

## Usage with TypeScript

When using TypeScript you can specify an interface representing the record type
stored in each file. E.g.

```ts
const { Database, Entity } = require('fakebase');

interface Apple extends Entity {
  variety: string;
  weight: number;
}

const db = new Database('./data');
const Apple = db.table<Apple>('apples'); // Apple: Table<Apple>
const apples = await Apple.findAll(); // apples: Apple[]
const apple = await Apple.findById('oY6H7nWVxaT60WJV3iN7M'); // apple: Apple
```

The `Entity` interface simply requires each object to have an `id`:

```ts
export interface Entity {
  id: string;
}
```

## History

This project started as
[Not a Real DB](https://github.com/mirkonasato/notarealdb).
It was rewritten to provide async rather than sync APIs, and renamed in the
process.

The initial inspiration was
[JSON Server](https://github.com/typicode/json-server), but that project keeps
all data in a single JSON file and I wanted to store each collection in a
separate file instead.
