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

  const stats = await client.gymUtils.getUserStats(
    client,
    'dex_raidcreate',
    limit,
    days
  );

  const messages = client.discordUtils.makeTable(stats.table, [
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

  await msg.channel.send(
    'Raid channels created by trainers since ' +
      stats.fromDate.format(client.config.general.dateformat)
  );
  await client.asyncForEach(messages, async (m) => {
    await msg.channel.send(m);
  });
};
