module.exports = (client, channel) => {
  console.log(`Channel created: ${channel.name}`);
  if (client.config.discord.categories.indexOf(channel.parentID) != -1) {
    client.watching[channel.id] = {
      gymId: null,
      gymName: null,
      userId: null,
      userName: null,
      userIds: [],
    };
    client.pool.query(
      "INSERT IGNORE INTO dex_raidcreate (`channel_id`) VALUES ('" +
        channel.id +
        "')"
    );
  }
};
