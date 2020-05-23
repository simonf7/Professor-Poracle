module.exports = (client, channel) => {
  console.log(`Channel created: ${channel.name}`);
  if (client.config.discord.categories.indexOf(channel.parentID) != -1) {
    client.watching[channel.id] = {
      gymId: null,
      gymName: null,
      userIds: [],
    };
  }
};
