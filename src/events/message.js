module.exports = async (client, msg) => {
  // Ignore all bots apart from Meowth
  if (msg.author.bot) {
    if (msg.author.id == '346759953006198784') {
      console.log('msg.id = ' + msg.id);
      msg.embeds.forEach((embed) => {
        embed.fields.forEach(async (field) => {
          if (field.name == 'Gym') {
            const gymId = await client.gymUtils.findGym(client, field.value);
            console.log(field.value + ' = ' + gymId);
            console.log('msg.channel.id = ' + msg.channel.id);
            console.log(client.watching);
            if (gymId > -1 && client.watching[msg.channel.id] == null) {
              client.watching[msg.channel.id] = gymId;
            }
          }
        });
      });
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
    .map((arg) => arg.replace(/_/, ' '));
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
