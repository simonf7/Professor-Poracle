module.exports = async (client) => {
  console.log(`Commando "${client.user.tag}" awaiting for orders!`);
  client.user.setPresence({
    game: {
      name: 'with Meowth',
    },
  });

  const channels = await client.channels.filter(
    (channel) => client.config.discord.categories.indexOf(channel.parentID) >= 0
  );
  channels.forEach((channel) => {
    console.log('Watching: ' + channel.name);
    client.watching[channel.id] = {
      gymId: null,
      gymName: null,
      userId: null,
      userName: null,
      raid: null,
      userIds: [],
    };
    client.pool.query(
      "INSERT IGNORE INTO dex_raidcreate (`channel_id`) VALUES ('" +
        channel.id +
        "')"
    );
  });
};
