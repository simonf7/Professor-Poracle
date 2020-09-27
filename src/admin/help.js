exports.run = async (client, msg, args) => {
  if (args[0] && client.dts.help[args[0]]) {
    const template = JSON.stringify(client.dts.help[args[0]].message);
    const message = client.mustache.render(template, []);
    msg.reply(JSON.parse(message));
  } else {
    let commands = [];
    let count = 0;
    let text = '';
    for (let key in client.dts.help) {
      commands[count] = key;
      text =
        text +
        client.emoji[count] +
        ': ' +
        client.dts.help[key].description +
        '\n';

      count += 1;
    }

    const message = await msg.reply({ embed: { description: text } });
    await client.asyncForEach(commands, async (c, i) => {
      await message.react(client.emoji[i]);
    });

    await message
      .awaitReactions(
        (reaction, user) =>
          user.id == msg.author.id &&
          ((client.emoji.indexOf(reaction.emoji.name) >= 0 &&
            client.emoji.indexOf(reaction.emoji.name) < commands.length) ||
            reaction.emoji.name == client.emojiQ),
        { max: 1, time: 30000 }
      )
      .then((collected) => {
        if (client.emoji.indexOf(collected.first().emoji.name) >= 0) {
          const selected =
            commands[client.emoji.indexOf(collected.first().emoji.name)];

          const template = JSON.stringify(client.dts.help[selected].message);
          const message = client.mustache.render(template, []);
          msg.reply(JSON.parse(message));
        }
        message.delete();
      })
      .catch(() => {
        message.delete();
      });
  }
};
