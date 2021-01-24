const getToday = require('../util/calendar').getToday;

exports.run = async (client, msg, args) => {
  const results = await getToday();

  console.log('results');

  let text = '';
  results.forEach((result) => {
    text =
      (text == '' ? '' : text + '\n') +
      '**' +
      result.summary +
      '**\n' +
      result.range +
      '\n' +
      result.url +
      '\n';
  });
  if (text == '') {
    text = 'Nothing going on down today!';
  }

  msg.reply({ embed: { description: text } });
};
