const pokemonNameToNumber = require('pokemon-gif/lib/pokemon-name-to-number');

exports.migrate = async (pool) => {
  await pool.query('ALTER TABLE dex_raidcreate ADD `level` INT NULL;');
  await pool.query('ALTER TABLE dex_raidcreate ADD `start` DATETIME NULL;');
  await pool.query('ALTER TABLE dex_raidcreate ADD `end` DATETIME NULL;');
  await pool.query('ALTER TABLE dex_raidcreate ADD pokemon_id INT NULL;');

  return true;
};
