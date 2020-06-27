exports.migrate = async (pool) => {
  await pool.query('ALTER TABLE dex_nests ADD message_id varchar(50) NULL');

  return true;
};
