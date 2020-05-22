exports.run = async (client, msg, args) => {
  // make sure we're watching the channel
  if (typeof client.watching[msg.channel.id] == 'undefined') {
    return;
  }

  let text = '';
  switch (msg.content.substring(1, 4)) {
    case 'can':
    case 'x':
      text = ' has cancelled';
      break;

    case 'int':
    case 'i':
    case 'may':
    case 'm':
      text = ' has expressed interest';
      break;

    case 'com':
    case 'c':
      text = " has said they're on their way";
      break;

    case 'her':
    case 'h':
      text = " has said they're at the raid";
      break;

    case 'sta':
      text = ' has set a start time';
      break;
  }

  text = '<@' + msg.author.id + '>' + text + ' in <#' + msg.channel.id + '>';

  client.watching[msg.channel.id].userIds.forEach((id) => {
    client.fetchUser(id, false).then((user) => {
      console.log('Notifying: ' + user.username);
      user.send(text);
    });
  });
};

exports.aliases = () => {
  return [
    'i',
    'maybe',
    'm',
    'coming',
    'c',
    'here',
    'h',
    'cancel',
    'x',
    'starttime',
  ];
};
