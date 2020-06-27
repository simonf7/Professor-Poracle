const pokemonNameToNumber = require('pokemon-gif/lib/pokemon-name-to-number');

exports.migrate = async (pool) => {
  await pool.query('ALTER TABLE dex_nests ADD last_update DATETIME NULL');

  await pool.query(
    'CREATE TABLE dex_nest_reports (id int(11) auto_increment NOT NULL, nest_id int(11) NOT NULL, user_id varchar(50) NOT NULL, reported DATETIME NOT NULL, CONSTRAINT dex_nest_reports_PK PRIMARY KEY (id))'
  );

  await pool.query(
    'CREATE INDEX dex_nest_reports_nest_id_IDX USING BTREE ON dex_nest_reports (nest_id)'
  );

  await pool.query(
    'CREATE INDEX dex_nest_reports_user_id_IDX USING BTREE ON dex_nest_reports (user_id)'
  );

  return true;
};
