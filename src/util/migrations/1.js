exports.migrate = async (pool) => {
  await pool.query(
    'CREATE TABLE dex_areas (role_id varchar(50) NOT NULL, name varchar(100) NOT NULL)'
  );

  await pool.query(
    'CREATE TABLE mad.dex_users (id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id varchar(50) NOT NULL, gym_id varchar(50) NOT NULL, CONSTRAINT dex_users_PK PRIMARY KEY (id))'
  );

  await pool.query(
    'CREATE TABLE mad.dex_roles (id INT UNSIGNED NOT NULL AUTO_INCREMENT, role_id varchar(50) NOT NULL, gym_id varchar(50) NOT NULL, CONSTRAINT dex_roles_PK PRIMARY KEY (id))'
  );

  return true;
};
