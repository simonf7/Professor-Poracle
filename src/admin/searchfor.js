exports.run = async (client, msg, args) => {
  const searchFor = args[0].replace(' ', '_');

  const user = client.discordUtils.findUser(client, searchFor);

  if (user) {
    const text =
      '**' +
      searchFor +
      '** found\nUsername: ' +
      user.username +
      '#' +
      user.discriminator +
      '\nId: ' +
      user.id;
    msg.reply(client.discordUtils.msgEmbed(text));
  } else {
    msg.reply(
      client.discordUtils.msgError('Sorry, **' + searchFor + '** not found')
    );
  }
};
