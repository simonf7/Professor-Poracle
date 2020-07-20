exports.run = async (client, msg, args) => {
  if (args && args.length > 1) {
    // first argument should be a pokemon
    let pokemon = args.shift();
    let monId = -1;
    if (pokemon === 'clear' || pokemon === 'nothing') {
      monId = 0;
    } else {
      monId = client.monsterUtils.getIdFromMon(client, pokemon);
      if (monId == 0) {
        monId = -1;
      }
    }

    if (monId >= 0) {
      client.nestUtils.selectNest(client, msg, args).then((nestId) => {
        if (nestId > 0) {
          client.nestUtils.nestName(client, nestId).then((nestName) => {
            client.pool
              .query(
                'UPDATE dex_nests SET pokemon_id = ' +
                  monId +
                  ', last_update = NOW() WHERE id = ' +
                  nestId
              )
              .then((res) => {
                client.pool
                  .query(
                    'INSERT INTO dex_nest_reports (`nest_id`, `user_id`, `reported`) VALUES (' +
                      nestId +
                      ",'" +
                      msg.author.id +
                      "',NOW())"
                  )
                  .then((res) => {
                    msg.react('✅');
                    msg
                      .reply(
                        client.discordUtils.msgOk(
                          '**' +
                            nestName +
                            '** set to **' +
                            (monId == 0
                              ? 'nothing'
                              : client.monsterUtils.getMonById(client, monId)
                                  .name) +
                            '**'
                        )
                      )
                      .then((message) => {
                        // auto delete the confirmation after 10 seconds
                        setTimeout(() => {
                          message.delete();
                        }, 10000);
                      });
                  });
              });
          });
        } else {
          msg.reply(
            client.discordUtils.msgError('Unknown nest: ' + args.join(' '))
          );
        }
      });
    } else {
      msg.reply(
        client.discordUtils.msgError('Pokemon not recognised: ' + pokemon)
      );
    }
  }
};
