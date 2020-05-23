const fs = require('fs');
const pool = require('./database');

const getVersion = async function (client) {
  let rows = await client.pool.query(
    "SELECT MAX(val) AS version FROM versions WHERE `key` = 'dex_version'"
  );

  if (rows[0].version !== null) {
    return rows[0].version;
  }

  await pool.query(
    "INSERT INTO versions (`key`, `val`) VALUES ('dex_version', 0)"
  );

  return 0;
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const migrate = async function (client) {
  let version = await getVersion(client);

  console.log('Database version = ' + version);

  await fs.readdir(`${__dirname}/migrations/`, async (err, files) => {
    if (err) return log.error(err);
    await asyncForEach(files, async (file) => {
      const migrateVersion = file.split('.')[0];
      if (migrateVersion > version) {
        const migration = require(`${__dirname}/migrations/${file}`);

        console.log('Running migration: ' + file);
        const result = await migration.migrate(client.pool);
        if (result === true) {
          console.log('- SUCCESS');
          await pool.query(
            'UPDATE versions SET `val` = ' +
              migrateVersion +
              " WHERE `key` = 'dex_version'"
          );
        } else {
          console.log('- FAILURE');
          throw 'Migration failed: ' + file;
        }
      }
    });
  });

  return await getVersion(client);
};

module.exports = {
  migrate,
};
