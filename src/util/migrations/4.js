exports.migrate = async (pool) => {
  const nests = [
    {
      area: 'Norwich',
      names: [
        'Barkers Lane Open Space',
        'Wilks Farm Play Area',
        'Sprowston Recreational Ground',
        'Sparhawk Park',
      ],
    },
  ];

  nests.forEach(async (nest) => {
    await pool.query(
      "INSERT INTO dex_areas (`name`) VALUES ('" + nest.area + "')"
    );

    const id = await pool.query(
      "SELECT id FROM dex_areas WHERE `name` = '" + nest.area + "'"
    );

    nest.names.forEach(async (name) => {
      await pool.query(
        "INSERT INTO dex_nests (`name`, `area_id`) VALUES ('" +
          name +
          "'," +
          id[0].id +
          ')'
      );
    });
  });

  return true;
};
