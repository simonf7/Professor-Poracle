const moment = require('moment'); // require

exports.run = async (client, msg, args) => {
  let days = 999;
  if (args.indexOf('week') >= 0) {
    days = 7;
  }

  let limit = 10;
  if (args.indexOf('all') >= 0) {
    limit = null;
  } else {
    args.forEach((a) => {
      if (parseInt(a) > 0) {
        limit = parseInt(a);
      }
    });
  }

  const early = moment().format('H') < 9;

  let sql = 'SELECT user_id, COUNT(*) AS total FROM ';
  if (days <= 7) {
    sql +=
      "(SELECT * FROM dex_raidcreate WHERE created > '" +
      moment()
        .subtract(early ? days + 1 : days, 'days')
        .format('Y-MM-DD') +
      " 23:59:59') rc";
  } else {
    sql += 'dex_raidcreate';
  }
  sql += ' GROUP BY user_id HAVING user_id IS NOT NULL ORDER BY total DESC';
  if (limit) {
    sql += ' LIMIT ' + limit;
  }

  client.pool.query(sql).then(async (rows) => {
    let userStats = null;

    if (days <= 7) {
      // get list of users
      let users = [];
      rows.forEach((r) => {
        users.push("'" + r.user_id + "'");
      });

      let sql =
        'SELECT user_id, DATE(created) AS created, COUNT(*) AS total FROM ';
      sql +=
        "(SELECT * FROM dex_raidcreate WHERE created > '" +
        moment()
          .subtract(early ? days + 1 : days, 'days')
          .format('Y-MM-DD') +
        " 23:59:59') rc";
      sql +=
        ' GROUP BY user_id, DATE(created) HAVING user_id IN (' +
        users.join(',') +
        ')';

      userStats = await client.pool.query(sql);
    }

    let headings = ['Trainer'];
    if (days <= 7) {
      let now = moment();
      if (early) {
        now.subtract(1, 'days');
      }
      for (let i = 0; i < days; i++) {
        headings.push(now.format('ddd'));
        now.subtract(1, 'days');
      }
    }
    headings.push('Total');
    let table = [];
    table.push(headings);

    await client.asyncForEach(rows, async (r) => {
      const user =
        client.users.get(r.user_id) || (await client.fetchUser(r.user_id));

      let data = [user.username];

      if (days <= 7) {
        let now = moment();
        if (early) {
          now.subtract(1, 'days');
        }
        for (let i = 0; i < days; i++) {
          let found = userStats.find((v) => {
            return (
              r.user_id == v.user_id &&
              now.format('D') == moment(v.created).format('D')
            );
          });
          if (typeof found == 'undefined') {
            data.push('0');
          } else {
            data.push(found.total.toString());
          }

          now.subtract(1, 'days');
        }
      }

      data.push(r.total.toString());
      table.push(data);
    });

    const message = client.discordUtils.makeTable(table, [
      'l',
      'r',
      'r',
      'r',
      'r',
      'r',
      'r',
      'r',
      'r',
    ]);

    await client.asyncForEach(message, async (m) => {
      await msg.channel.send(m);
    });
  });
};
