exports.migrate = async (pool) => {
  await pool.query('RENAME TABLE dex_areas TO dex_locations');

  await pool.query(
    'CREATE TABLE dex_nests (id INTEGER NOT NULL AUTO_INCREMENT, name varchar(100) NOT NULL, area_id INTEGER NULL, pokemon_Id INTEGER DEFAULT 0 NOT NULL, shiny BINARY DEFAULT FALSE NOT NULL, CONSTRAINT dex_nests_PK PRIMARY KEY (id))'
  );

  await pool.query(
    'CREATE TABLE dex_areas (id INTEGER NOT NULL AUTO_INCREMENT, name varchar(100) NULL, CONSTRAINT dex_areas_PK PRIMARY KEY (id))'
  );

  return true;
};
