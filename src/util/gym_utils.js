const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const gymName = async (client, gym_id) => {
  const result = await client.pool.query(
    "SELECT name FROM gymdetails WHERE gym_id = '" + gym_id + "'"
  );
  if (result.length == 1) {
    return result[0].name;
  }

  return 'Unknown';
};

const selectGym = async (client, msg, args) => {
  args = args.map((arg) => "`name` LIKE '%" + arg.replace("'", "\\'") + "%'");

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

    const message = await msg.reply({ embed: { description: text } });
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

  return gymId;
};

const findGym = async (client, gym) => {
  // extract lon/lat
  const location = gym.match(/[0-9]+[.][0-9]+/g);
  if (location.length == 2) {
    const result = await client.pool.query(
      "SELECT * FROM gym WHERE `latitude`='" +
        location[0] +
        "' AND `longitude`='" +
        location[1] +
        "'"
    );
    if (result.length > 0) {
      return result[0].gym_id;
    }
  }

  // get name
  let name = gym.match(/\[(.+)\]/g);
  if (name.length > 0) {
    name = name[0].match(/[^\[\]]+/g);
  }
  if (name.length > 0) {
    name = name[0].replace(/ \(EX Raid Gym\)/g, '');

    const result = await client.pool.query(
      "SELECT * FROM gymdetails WHERE `name`='" + name + "'"
    );

    if (result.length > 0) {
      return result[0].gym_id;
    }
  }

  return -1;
};

module.exports = {
  gymName,
  selectGym,
  findGym,
};
