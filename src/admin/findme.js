exports.run = async (client, msg, args) => {
  const searchFor = args[0].replace(' ', '_');

  const members = await client.discordUtils.findUsers(client, searchFor);

  if (members.length > 5) {
    msg.reply(
      client.discordUtils.msgError(
        'Sorry, too many matches (' +
          members.length +
          ') for **' +
          searchFor +
          '** to list'
      )
    );
  } else if (members.length > 0) {
    msg.reply(
      members.length +
        ' match' +
        (members.length > 1 ? 'es' : '') +
        ' found for **' +
        searchFor +
        '**'
    );
    members.forEach((member) => {
      const text =
        'Name: @' +
        member.displayName +
        '\nUsername: ' +
        member.user.username +
        '#' +
        member.user.discriminator;
      msg.channel.send(client.discordUtils.msgEmbed(text));
    });
  } else {
    msg.reply(
      client.discordUtils.msgError('Sorry, **' + searchFor + '** not found')
    );
  }
};
