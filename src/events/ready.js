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
      message: null,
      userIds: [],
    };
    client.pool.query(
      "INSERT IGNORE INTO dex_raidcreate (`channel_id`) VALUES ('" +
        channel.id +
        "')"
    );
  });

  setInterval(async () => {
    const nestsUpdate = await client.utils.getSetting(
      client,
      'nests_update_required'
    );

    if (nestsUpdate && nestsUpdate == 'yes') {
      const cmd = client.admin.get('nestsupdate');
      if (cmd) {
        await cmd.run(client, null, []);
      }

      client.utils.setSetting(client, 'nests_update_required', 'no');
    }
  }, 900000);

  if (client.config.discord.tidy && client.config.discord.tidy.length > 0) {
    await client.asyncForEach(client.config.discord.tidy, async (id) => {
      const channel = await client.channels.get(id);
      console.log('Tidying: ' + channel.name);
    });

    setInterval(async () => {
      await client.asyncForEach(client.config.discord.tidy, async (id) => {
        const channel = await client.channels.get(id);

        client.discordUtils.tidyChannel(channel);
      });
    }, 60000);
  }
};
