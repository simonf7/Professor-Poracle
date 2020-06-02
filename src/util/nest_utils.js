const nestName = async (client, nest_id) => {
  const result = await client.pool.query(
    "SELECT name FROM dex_nests WHERE id = '" + nest_id + "'"
  );
  if (result.length == 1) {
    return result[0].name;
  }

  return 'Unknown';
};

const selectNest = async (client, msg, args) => {
  args = args.filter((arg) => arg.length > 2);
  if (args.length == 0) {
    return -1;
  }
  args = args.map((arg) => "`name` LIKE '%" + arg.replace("'", "\\'") + "%'");

  const rows = await client.pool.query(
    'SELECT id, name FROM dex_nests WHERE ' + args.join(' AND ')
  );

  let nestId = -1;
  if (rows.length == 1) {
    nestId = rows[0].id;
  } else if (rows.length > 1 && rows.length < client.emoji.length) {
    let text = '';
    rows.forEach((nest, i) => {
      text = text + client.emoji[i] + ': ' + nest.name + '\n';
    });
    text = text + client.emojiQ + ': Unknown';

    const message = await msg.reply({ embed: { description: text } });
    await asyncForEach(rows, async (nest, i) => {
      await message.react(client.emoji[i]);
    });
    await message.react(client.emojiQ);

    await message
      .awaitReactions(
        (reaction, user) =>
          user.id == msg.author.id &&
          ((client.emoji.indexOf(reaction.emoji.name) >= 0 &&
            client.emoji.indexOf(reaction.emoji.name) < rows.length) ||
            reaction.emoji.name == client.emojiQ),
        { max: 1, time: 30000 }
      )
      .then((collected) => {
        if (client.emoji.indexOf(collected.first().emoji.name) >= 0) {
          nestId =
            rows[client.emoji.indexOf(collected.first().emoji.name)].gym_id;
        }
        message.delete();
      })
      .catch(() => {
        message.delete();
      });
  }

  return nestId;
};

const getNestText = async function (client) {
  const sql =
    'SELECT dex_nests.name, pokemon_id, shiny, dex_areas.id AS area_id, dex_areas.name AS area_name FROM dex_nests LEFT JOIN dex_areas ON dex_areas.id = dex_nests.area_id ORDER BY dex_areas.name, dex_nests.name';

  return client.pool.query(sql).then((rows) => {
    let text = '';
    let lastArea = '';

    rows.forEach((r) => {
      text = text + (text === '' ? '' : '\n');
      if (lastArea !== r.area_name) {
        text = text + ('__**' + r.area_name + '**__\n');
      }
      text = text + r.name + ': ';

      if (r.pokemon_id > 0) {
        let pokemon = client.monsterUtils.getMonById(client, r.pokemon_id);

        if (pokemon) {
          if (r.shiny == 1) {
            text = text + ':sparkles: ';
          }
          text = text + '**' + pokemon.name + '**';
          if (r.shiny == 1) {
            text = text + ' :sparkles:';
          }
        }
      }

      lastArea = r.area_name;
    });

    return text;
  });
};

module.exports = {
  nestName,
  selectNest,
  getNestText,
};
