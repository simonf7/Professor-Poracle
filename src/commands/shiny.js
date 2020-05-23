const moment = require('moment'); // require
const fetch = require('node-fetch');

exports.run = async (client, msg, args) => {
  let timeFrom = moment('2019-01-01 00:00:00');
  let timeTo = moment();

  if (args[0]) {
    timeFrom = moment(Date.parse(args[0]));
    if (args[1]) {
      timeTo = moment(Date.parse(args[1]));
    }
  }

  const timeFormat = 'Do MMM YYYY, h:mma';

  const url =
    client.config.mad.host +
    '/get_game_stats_shiny?from=' +
    timeFrom.format('X') +
    '&to=' +
    timeTo.format('X');

  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      let text =
        'Shinies found ' +
        timeFrom.format(timeFormat) +
        ' to ' +
        timeTo.format(timeFormat) +
        '\n';
      let mons = json.global_shiny_statistics.sort((a, b) =>
        a.odds < b.odds ? -1 : a.odds > b.odds ? 1 : 0
      );
      mons.forEach((row) => {
        if (text.length > 1900) {
          msg.channel.send(text);
          text = '';
        }

        if (text != '') {
          text = text + '\n';
        }
        text =
          text +
          '**' +
          row.name +
          '** odds: 1/' +
          row.odds +
          ' encounters: ' +
          row.count;
      });
      msg.channel.send(text);
    });
};
