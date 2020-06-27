exports.run = async (client, msg, args) => {
  if (args && args.length > 0) {
    if (args[0] === 'confirm') {
      await client.pool.query('UPDATE dex_nests SET `pokemon_id` = 0');

      msg.reply(client.discordUtils.msgOk('Nests cleared'));
    }
  }
};
