exports.run = async (client, msg, args) => {
  // make sure we're watching the channel
  if (typeof client.watching[msg.channel.id] == 'undefined') {
    console.log('Not watching channel: ' + msg.channel.id);
    return;
  }

  let message = null;
  if (client.watching[msg.channel.id].userIds.indexOf(msg.author.id) == -1) {
    client.watching[msg.channel.id].userIds.push(msg.author.id);
    message = await msg.reply({
      embed: { description: ':white_check_mark: Notifications on' },
    });
    console.log(
      `${msg.author.username} requested notifications for ${msg.channel.name}`
    );
  } else {
    client.watching[msg.channel.id].userIds.splice(
      client.watching[msg.channel.id].userIds.indexOf(msg.author.id),
      1
    );
    message = await msg.reply({
      embed: { description: ':white_check_mark: Notifications off' },
    });
    console.log(
      `${msg.author.username} turned off notifications for ${msg.channel.name}`
    );
  }

  // auto delete the confirmation after 5 seconds
  if (message) {
    setTimeout(() => {
      message.delete();
    }, 5000);
  }
};

exports.aliases = () => {
  return ['n'];
};
