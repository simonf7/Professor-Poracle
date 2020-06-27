exports.migrate = async (pool) => {
  await pool.query(
    'ALTER TABLE dex_areas ADD sort int(11) DEFAULT 999999 NOT NULL'
  );

  await pool.query(
    'CREATE TABLE dex_settings (`key` varchar(100) NOT NULL, value varchar(4096) NULL, CONSTRAINT dex_settings_PK PRIMARY KEY (`key`))'
  );

  return true;
};
