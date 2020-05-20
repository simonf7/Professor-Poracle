const moment = require('moment'); // require

exports.run = async (client, msg, args) => {
  let watching = '';
  for (let key in client.watching) {
    const channel = client.channels.find((c) => c.id == key);

    watching = watching + (watching != '' ? ', ' : '') + channel.name;
    if (client.watching[key] != null) {
      watching =
        watching +
        ' (' +
        (await client.gymUtils.gymName(client.watching[key])) +
        ')';
    }
  }
  if (watching == '') {
    watching = 'None';
  }

  const view = {
    username: client.user.username,
    ready: moment(client.readyAt).fromNow(),
    pings: client.pings,
    dbVersion: client.dbVersion,
    watching: watching,
  };

  const template = JSON.stringify(client.dts.status);
  const message = client.mustache.render(template, view);
  msg.reply(JSON.parse(message));

  console.log(`${msg.author.username} requested status`);
};
