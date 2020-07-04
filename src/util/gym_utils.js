const moment = require('moment'); // require

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const gymName = async (client, gym_id) => {
  const result = await client.pool.query(
    "SELECT name FROM gymdetails WHERE gym_id = '" + gym_id + "'"
  );
  if (result.length == 1) {
    return result[0].name;
  }

  return 'Unknown';
};

const selectGym = async (client, msg, args) => {
  args = args.filter((arg) => arg.length > 2);
  if (args.length == 0) {
    return -1;
  }
  args = args.map((arg) => "`name` LIKE '%" + arg.replace("'", "\\'") + "%'");

  const rows = await client.pool.query(
    "SELECT gymdetails.gym_id, name, dex_users.user_id FROM gymdetails LEFT JOIN dex_users ON dex_users.gym_id = gymdetails.gym_id AND dex_users.user_id = '" +
      msg.author.id +
      "' WHERE " +
      args.join(' AND ')
  );

  let gymId = -1;
  if (rows.length == 1) {
    gymId = rows[0].gym_id;
  } else if (rows.length > 1 && rows.length < client.emoji.length) {
    let text = '';
    rows.forEach((gym, i) => {
      text =
        text +
        client.emoji[i] +
        ': ' +
        gym.name +
        (gym.user_id ? ' :eyes:' : '') +
        '\n';
    });
    text = text + client.emojiQ + ': Unknown';

    const message = await msg.reply({ embed: { description: text } });
    await asyncForEach(rows, async (gym, i) => {
      await message.react(client.emoji[i]);
    });
    await message.react(client.emojiQ);

    await message
      .awaitReactions(
        (reaction, user) =>
          user.id == msg.author.id &&
          ((client.emoji.indexOf(reaction.emoji.name) >= 0 &&
            client.emoji.indexOf(reaction.emoji.name) < rows.length) ||
            reaction.emoji.name == client.emojiQ),
        { max: 1, time: 30000 }
      )
      .then((collected) => {
        if (client.emoji.indexOf(collected.first().emoji.name) >= 0) {
          gymId =
            rows[client.emoji.indexOf(collected.first().emoji.name)].gym_id;
        }
        message.delete();
      })
      .catch(() => {
        message.delete();
      });
  }

  return gymId;
};

const findGym = async (client, gym) => {
  // extract lon/lat
  const location = gym.match(/[0-9]+[.][0-9]+/g);
  if (location && location.length == 2) {
    const result = await client.pool.query(
      "SELECT * FROM gym WHERE `latitude`='" +
        location[0] +
        "' AND `longitude`='" +
        location[1] +
        "'"
    );
    if (result.length > 0) {
      return result[0].gym_id;
    }
  }

  // get name
  let name = gym.match(/\[(.+)\]/g);
  if (name && name.length > 0) {
    name = name[0].match(/[^\[\]]+/g);
  }
  if (name && name.length > 0) {
    name = name[0].replace(/ \(EX Raid Gym\)/g, '');

    const result = await client.pool.query(
      "SELECT * FROM gymdetails WHERE `name`='" + name + "'"
    );

    if (result.length > 0) {
      return result[0].gym_id;
    }
  }

  return -1;
};

const _countQuery = async (client, source, idField, dateField, limit, days) => {
  const early = moment().format('H') < 9;

  let sql = 'SELECT ' + idField + ' AS id, COUNT(*) AS total FROM ';
  if (days <= 7) {
    sql +=
      '(SELECT * FROM ' +
      source +
      ' WHERE ' +
      dateField +
      " > '" +
      moment()
        .subtract(early ? days + 1 : days, 'days')
        .format('Y-MM-DD') +
      " 23:59:59') rc";
  } else {
    sql += source;
  }
  sql +=
    ' GROUP BY ' +
    idField +
    ' HAVING ' +
    idField +
    ' IS NOT NULL ORDER BY total DESC';
  if (limit) {
    sql += ' LIMIT ' + limit;
  }

  return client.pool.query(sql).then(async (rows) => {
    let stats = null;

    if (days <= 7) {
      // get list of users
      let users = [];
      rows.forEach((r) => {
        users.push("'" + r.id + "'");
      });

      let sql =
        'SELECT ' +
        idField +
        ' AS id, DATE(' +
        dateField +
        ') AS ' +
        dateField +
        ', COUNT(*) AS total FROM ';
      sql +=
        '(SELECT * FROM ' +
        source +
        ' WHERE ' +
        dateField +
        " > '" +
        moment()
          .subtract(early ? days + 1 : days, 'days')
          .format('Y-MM-DD') +
        " 23:59:59') rc";
      sql +=
        ' GROUP BY ' +
        idField +
        ', DATE(' +
        dateField +
        ') HAVING ' +
        idField +
        ' IN (' +
        users.join(',') +
        ')';

      stats = await client.pool.query(sql);
    }

    // get date the data comes from
    let fromDate = null;
    if (days <= 7) {
      fromDate = moment(
        moment()
          .subtract(early ? days : days - 1, 'days')
          .format('Y-MM-DD') + ' 00:00:00'
      );
    } else {
      let sql = 'SELECT MIN(' + dateField + ') AS fromDate FROM ' + source;
      const result = await client.pool.query(sql);
      if (result) {
        fromDate = moment(result[0].fromDate);
      }
    }
    return { rows: rows, stats: stats, fromDate: fromDate };
  });
};

const getGymStats = async (client, source, limit, days) => {
  const early = moment().format('H') < 9;

  const stats = await _countQuery(
    client,
    source,
    'gym_id',
    'created',
    limit,
    days
  );

  let headings = ['Gym'];
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

  await client.asyncForEach(stats.rows, async (r) => {
    const gym = await gymName(client, r.id);

    let data = [gym];

    if (days <= 7) {
      let now = moment();
      if (early) {
        now.subtract(1, 'days');
      }
      for (let i = 0; i < days; i++) {
        let found = stats.stats.find((v) => {
          return (
            r.id == v.id && now.format('D') == moment(v.created).format('D')
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

  return { table: table, fromDate: stats.fromDate };
};

const getUserStats = async (client, source, limit, days) => {
  const early = moment().format('H') < 9;

  const stats = await _countQuery(
    client,
    source,
    'user_id',
    'created',
    limit,
    days
  );

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

  await client.asyncForEach(stats.rows, async (r) => {
    const user = client.users.get(r.id) || (await client.fetchUser(r.id));

    let data = [user.username];

    if (days <= 7) {
      let now = moment();
      if (early) {
        now.subtract(1, 'days');
      }
      for (let i = 0; i < days; i++) {
        let found = stats.stats.find((v) => {
          return (
            r.id == v.id && now.format('D') == moment(v.created).format('D')
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

  return { table: table, fromDate: stats.fromDate };
};

module.exports = {
  gymName,
  selectGym,
  findGym,
  getGymStats,
  getUserStats,
};
