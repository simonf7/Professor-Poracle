exports.migrate = async (pool) => {
  await pool.query("INSERT INTO dex_areas (`name`) VALUES ('Norwich')");

  const id = await pool.query(
    "SELECT id FROM dex_areas WHERE `name` = 'Norwich'"
  );
  console.log(id[0].id);

  await pool.query(
    "INSERT INTO dex_nests (`name`, `area_id`) VALUES ('Barkers Lane Open Space'," +
      id[0].id +
      ')'
  );

  await pool.query(
    "INSERT INTO dex_nests (`name`, `area_id`) VALUES ('Wilks Farm Play Area'," +
      id[0].id +
      ')'
  );

  await pool.query(
    "INSERT INTO dex_nests (`name`, `area_id`) VALUES ('Sprowston Recreational Ground'," +
      id[0].id +
      ')'
  );

  await pool.query(
    "INSERT INTO dex_nests (`name`, `area_id`) VALUES ('Sparhawk Park'," +
      id[0].id +
      ')'
  );

  return true;
};
