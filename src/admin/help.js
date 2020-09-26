exports.run = async (client, msg, args) => {
  if (args[0]) {
    const helpStr = 'help_' + args[0];

    if (client.dts[helpStr]) {
      const template = JSON.stringify(client.dts[helpStr]);
      const message = client.mustache.render(template, []);
      msg.reply(JSON.parse(message));
    }
  }
};
