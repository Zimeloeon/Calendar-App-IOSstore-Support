import {enablePromise, openDatabase} from 'react-native-sqlite-storage';

const tableName = 'birthdayData';

enablePromise(true);

export const getDBConnection = async () => {
    const errorCB = async (err) => {
        console.log("SQL Error: " + err);
    }
      
    const successCB = async () => {
        //console.log("SQL executed fine");
    }

    const conn = openDatabase({name: 'my.db', location: 'default'}, successCB, errorCB);

    return conn;
};

export const createTable = async (db) => {
    // create table if not exists
    const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
          value TEXT NOT NULL,
          date TEXT NOT NULL,
          type TEXT NOT NULL
      );`;
    await db.executeSql(query);
  };

  export const getTodoItems = async (db, type) => {
    try {
      const todoItems = [];
      const results = await db.executeSql(`SELECT rowid as id,value,date,type FROM ${tableName} WHERE type like '%${type}%'`);
      results.forEach(result => {
        for (let index = 0; index < result.rows.length; index++) {
          todoItems.push(result.rows.item(index))
        }
      });
      return todoItems;
    } catch (error) {
      console.error(error);
      throw Error('Failed to get todoItems !!!');
    }
  };

  export const getTodoItemsFilter = async (db, filter, type) => {
    try {
      const todoItems = [];
      const results = await db.executeSql(`SELECT rowid as id,value,date,type FROM ${tableName}
        WHERE value like '%${filter}%' and type like '%${type}%'`);
      results.forEach(result => {
        for (let index = 0; index < result.rows.length; index++) {
          todoItems.push(result.rows.item(index))
        }
      });
      return todoItems;
    } catch (error) {
      console.error(error);
      throw Error('Failed to get todoItems !!!');
    }
  };

  export const saveTodoItems = async (db, todoItems) => {
    const insertQuery =
      `INSERT OR REPLACE INTO ${tableName}(rowid, value, date, type) values` +
      todoItems.map(i => `(${i.id}, '${i.value}', '${i.date}', '${i.type}')`).join(',');
  
    return db.executeSql(insertQuery);
  };
  
  export const deleteTodoItem = async (db, id) => {
    const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`;
    await db.executeSql(deleteQuery);
  };
  
  export const deleteTable = async (db) => {
    const query = `drop table ${tableName}`;
  
    await db.executeSql(query);
  };