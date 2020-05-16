var moment = require('moment'); // require

exports.run = async (client, msg, args) => {
  const view = {
    username: client.user.username,
    ready: moment(client.readyAt).fromNow(),
    pings: client.pings,
  };

  const template = JSON.stringify(client.dts.status);
  const message = client.mustache.render(template, view);
  msg.reply(JSON.parse(message));

  console.log(`${msg.author.username} requested status`);
};
