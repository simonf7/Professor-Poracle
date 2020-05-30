exports.run = async (client, msg, args) => {
  client.pool
    .query(
      'SELECT user_id, COUNT(*) AS total FROM dex_raidcreate GROUP BY user_id HAVING user_id IS NOT NULL ORDER BY total DESC'
    )
    .then((rows) => {
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
