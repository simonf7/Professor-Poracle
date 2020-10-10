const execSync = require('child_process').execSync;

exports.run = async (client, msg, args) => {
  args = args.map((a) => {
    return a.replace(' ', '_');
  });

  const cmd = 'pm2 ' + args.join(' ');

  try {
    const output = execSync(cmd, { encoding: 'utf-8' }); // the default is 'buffer'
    msg.reply(client.discordUtils.msgEmbed('```' + output + '```'));
  } catch (err) {
    msg.reply(
      client.discordUtils.msgEmbed('```' + err.stderr.toString() + '```')
    );
  }
};
