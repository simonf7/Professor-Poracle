exports.run = async (client, msg, args) => {
  if (args && args.length > 1) {
    // first argument should be a pokemon
    let pokemon = args.shift();
    let monId = client.monsterUtils.getIdFromMon(client, pokemon, 0);

    client.nestUtils.selectNest(client, msg, args).then((nestId) => {
      if (nestId > 0) {
        client.nestUtils.nestName(client, nestId).then((nestName) => {
          client.pool
            .query(
              'UPDATE dex_nests SET pokemon_id = ' +
                monId +
                ' WHERE id = ' +
                nestId
            )
            .then((res) => {
              msg.reply(
                client.discordUtils.msgOk(
                  '**' +
                    nestName +
                    '** set to **' +
                    client.monsterUtils.getMonById(client, monId).name +
                    '**'
                )
              );
            });
        });
      } else {
        msg.reply(client.discordUtils.msgError('Unknown nest'));
      }
    });
  }
};
