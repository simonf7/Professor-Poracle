const pokemonNameToNumber = require('pokemon-gif/lib/pokemon-name-to-number');

exports.migrate = async (pool) => {
  await pool.query(
    'CREATE TABLE dex_mentions (id INT auto_increment NOT NULL, channel_id varchar(50) NOT NULL, user_id varchar(50) NOT NULL, role_id varchar(50) NOT NULL, CONSTRAINT dex_mentions_PK PRIMARY KEY (id))'
  );

  return true;
};
