const dayjs = require('dayjs');
const getTodayText = require('../util/calendar').getTodayText;

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
    const todayChannels = await client.utils.getSetting(
      client,
      'today_channels'
    );
    const todayNext = await client.utils.getSetting(client, 'today_next');

    if (todayChannels && todayNext && dayjs().isAfter(dayjs(todayNext))) {
      const text = await getTodayText();
      const ids = todayChannels.split(' ');
      await client.asyncForEach(ids, async (id) => {
        const channel = await client.channels.get(id);
        await client.discordUtils.deleteFromChannel(client, channel);
        channel.send(client.discordUtils.msgEmbed(text));
      });

      client.utils.setSetting(
        client,
        'today_next',
        dayjs(todayNext).add(6, 'hour').format('YYYY-MM-DD HH:mm:ss')
      );
    }
  }, 3600000);

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

        try {
          client.discordUtils.tidyChannel(channel);
        } catch (err) {
          console.log(err.message);
        }
      });
    }, 60000);
  }
};
