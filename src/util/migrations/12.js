const pokemonNameToNumber = require('pokemon-gif/lib/pokemon-name-to-number');

exports.migrate = async (pool) => {
  await pool.query(
    'CREATE TABLE dex_friendcodes (user_id varchar(50) NOT NULL, friend_code varchar(16) NOT NULL, CONSTRAINT dex_friendcodes_PK PRIMARY KEY (user_id))'
  );

  return true;
};
