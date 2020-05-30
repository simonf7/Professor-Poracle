exports.run = async (client, msg, args) => {
  let sql =
    'SELECT user_id, COUNT(*) AS total FROM dex_raidcreate GROUP BY user_id HAVING user_id IS NOT NULL ORDER BY total DESC';
  let limit = null;

  if (args.length == 0) {
    limit = 10;
  }
  if (args.length > 0 && args[0] !== 'all') {
    limit = parseInt(args[0]);
  }
  if (limit) {
    sql = sql + ' LIMIT ' + limit;
  }

  client.pool.query(sql).then((rows) => {
    let table = [];
    table.push(['User', 'Raids']);
    rows.forEach(async (r) => {
      const user =
        client.users.get(r.user_id) || (await client.fetchUser(r.user_id));

      table.push([user.username, r.total.toString()]);
    });

    msg.reply(client.discordUtils.showTable(table, ['l', 'r']));
  });
};
