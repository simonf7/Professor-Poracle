module.exports = (client, channel) => {
  if (client.config.discord.categories.indexOf(channel.parentID) != -1) {
    console.log(`Channel created: ${channel.name}`);
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
  }
};
