const pokemonNameToNumber = require('pokemon-gif/lib/pokemon-name-to-number');

exports.migrate = async (pool) => {
  await pool.query(
    'CREATE TABLE dex_interest (id INT auto_increment NOT NULL, channel_id varchar(50) NOT NULL, user_id varchar(50) NOT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT dex_raid_interest_PK PRIMARY KEY (id))'
  );

  return true;
};
