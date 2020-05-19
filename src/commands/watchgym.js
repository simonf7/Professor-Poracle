const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.run = async (client, msg, args) => {
  args = args.map((arg) => "`name` LIKE '%" + arg + "%'");

  const rows = await client.pool.query(
    'SELECT gym_id, name FROM gymdetails WHERE ' + args.join(' AND ')
  );

  let gymId = -1;
  if (rows.length == 1) {
    gymId = rows[0].gym_id;
  } else {
    let text = '';
    rows.forEach((gym, i) => {
      text = text + '\n' + client.emoji[i] + ': ' + gym.name;
    });
    let message = await msg.reply(text);
    asyncForEach(rows, async (gym, i) => {
      await message.react(client.emoji[i]);
    });

    await message
      .awaitReactions(
        (reaction, user) =>
          user.id == msg.author.id &&
          client.emoji.indexOf(reaction.emoji.name) >= 0 &&
          client.emoji.indexOf(reaction.emoji.name) < rows.length,
        { max: 1, time: 30000 }
      )
      .then((collected) => {
        gymId = rows[client.emoji.indexOf(collected.first().emoji.name)].gym_id;
        message.delete();
      })
      .catch(() => {
        message.delete();
      });
  }

  msg.reply(gymId);
};
