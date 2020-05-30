module.exports = async (client, msg) => {
  // Ignore all bots apart from Meowth
  if (msg.author.bot) {
    if (
      client.config.discord.meowth.indexOf(msg.author.id) >= 0 &&
      client.config.discord.categories.indexOf(msg.channel.parentID) >= 0
    ) {
      client.discordUtils.processMeowthPinned(client, msg);
    }
    return;
  }

  // Ignore msgs not starting with the prefix (in config)
  if (!msg.content.startsWith(client.config.discord.prefix)) return;

  // Check commands
  let args = msg.content
    .slice(client.config.discord.prefix.length)
    .trim()
    .split(/ +/g);
  args = args
    .map((arg) => arg.toLowerCase())
    .map((arg) => arg.replace(/_/g, ' '));

  const command = args.shift().toLowerCase();
  const cmd = client.commands.get(command);
  if (cmd) {
    cmd.run(client, msg, args);
    return;
  }

  // Check admin commands
  if (client.config.discord.admin.indexOf(msg.author.id) != -1) {
    const admin = client.admin.get(command);
    if (admin) {
      admin.run(client, msg, args);
      return;
    }
  }
};
