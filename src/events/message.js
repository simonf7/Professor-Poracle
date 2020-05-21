module.exports = async (client, msg) => {
  // Ignore all bots apart from Meowth
  if (msg.author.bot) {
    if (
      client.config.discord.meowth.indexOf(msg.author.id) >= 0 &&
      client.config.discord.categories.indexOf(msg.channel.parentID) >= 0
    ) {
      msg.embeds.forEach((embed) => {
        embed.fields.forEach(async (field) => {
          if (field.name == 'Gym') {
            const gymId = await client.gymUtils.findGym(client, field.value);
            const gymName = await client.gymUtils.gymName(client, gymId);

            if (gymId != -1 && client.watching[msg.channel.id] === null) {
              console.log('Gym recognised: ' + gymName + ' (' + gymId + ')');
              client.watching[msg.channel.id] = gymId;

              const results = await client.pool.query(
                "SELECT user_id FROM dex_users WHERE gym_id='" + gymId + "'"
              );
              if (results.length > 0) {
                results.forEach((r) => {
                  client.fetchUser(r.user_id, false).then((user) => {
                    console.log('Notifying: ' + user.username);
                    user.send(
                      'Raid reported at ' +
                        gymName +
                        ' <#' +
                        msg.channel.id +
                        '>'
                    );
                  });
                });
              }
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
