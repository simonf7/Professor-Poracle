exports.run = async (client, msg, args) => {
  if (args && args.length > 0) {
    if (args[0] === 'confirm') {
      const cmd = '/home/simon/sync/update_nests.sh';

      try {
        const output = execSync(cmd, { encoding: 'utf-8' }); // the default is 'buffer'
        msg.reply(client.discordUtils.msgEmbed('```' + output + '```'));
      } catch (err) {
        msg.reply(
          client.discordUtils.msgEmbed('```' + err.stderr.toString() + '```')
        );
      }
    }
  }
};
