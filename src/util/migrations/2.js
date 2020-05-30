exports.migrate = async (pool) => {
  await pool.query(
    'CREATE TABLE mad.dex_raidcreate (channel_id varchar(50) NOT NULL, gym_id varchar(50) DEFAULT NULL, user_id varchar(50) DEFAULT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT dex_raidcreate_PK PRIMARY KEY (channel_id))'
  );

  return true;
};
