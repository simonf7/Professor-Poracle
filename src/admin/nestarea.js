exports.run = async (client, msg, args) => {
  if (args && args.length > 0) {
    let nestId = await client.nestUtils.selectNest(
      client,
      msg,
      args,
      'Which nest to update?'
    );
    if (nestId != -1) {
      let nestName = await client.nestUtils.nestName(client, nestId);
      let areaId = await client.nestUtils.selectArea(
        client,
        msg,
        'Select a new area for **' + nestName + '**'
      );
      if (areaId != -1) {
        let areaName = await client.nestUtils.areaName(client, areaId);

        await client.pool.query(
          'UPDATE dex_nests SET `area_id` = ' + areaId + ' WHERE id = ' + nestId
        );

        msg.reply(
          client.discordUtils.msgOk(
            '**' + nestName + '** now set to **' + areaName + '**'
          )
        );
      }
    }
  }
};
