module.exports = async (client, oldMsg, msg) => {
  // Ignore all bots apart from Meowth
  if (msg.author.bot) {
    if (
      client.config.discord.meowth.indexOf(msg.author.id) >= 0 &&
      client.config.discord.categories.indexOf(msg.channel.parentID) >= 0
    ) {
      console.log('messageUpdate');
      client.discordUtils.processMeowthMessage(client, msg);
    }
    return;
  }
};
