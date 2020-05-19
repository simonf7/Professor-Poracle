module.exports = (client, channel) => {
  console.log(`channelCreate: ${channel}`);
  if (client.config.discord.categories.indexOf(channel.parentID) != -1) {
    client.watching[channel.id] = null;
  }
};
