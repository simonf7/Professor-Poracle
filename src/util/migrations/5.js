exports.migrate = async (pool) => {
  await pool.query('ALTER TABLE dex_nests DROP COLUMN shiny');
  await pool.query('ALTER TABLE dex_nests ADD lat DOUBLE NULL');
  await pool.query('ALTER TABLE dex_nests ADD lon DOUBLE NULL');

  return true;
};
