exports.run = async (client, msg, args) => {
  if (args && args.length > 0) {
    args = args.map((a) => a.charAt(0).toUpperCase() + a.slice(1));

    let nestName = args.join(' ');
    let areaId = await client.nestUtils.selectArea(
      client,
      msg,
      'Select an area to add **' + nestName + '** to'
    );

    await client.pool.query(
      "INSERT INTO dex_nests (`name`,`area_id`) VALUES ('" +
        nestName.replace("'", "\\'") +
        "'," +
        areaId +
        ')'
    );

    let areaName = await client.nestUtils.areaName(client, areaId);
    msg.reply(
      client.discordUtils.msgOk(
        'Nest **' + nestName + '** added to **' + areaName + '**'
      )
    );
  }
};
