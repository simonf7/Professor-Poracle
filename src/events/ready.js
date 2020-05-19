module.exports = async (client) => {
  console.log(`Commando "${client.user.tag}" awaiting for orders!`);
  client.user.setPresence({
    game: {
      name: 'Hanging Around',
    },
  });
  const channels = await client.channels.filter(
    (channel) => client.config.discord.categories.indexOf(channel.parentID) >= 0
  );
  channels.forEach((channel) => {
    console.log('Watching: ' + channel.name);
    client.watching[channel.id] = null;
  });
};
