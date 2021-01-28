const ical = require('node-ical');
const dayjs = require('dayjs');

const getToday = async () => {
  let eventArray = [];

  const events = await ical.async.fromURL(
    'https://calendar.google.com/calendar/ical/l7c9u0a3n2fsvl2kknmecvnp38%40group.calendar.google.com/public/basic.ics'
  );

  if (events) {
    let today = dayjs().hour(0).minute(0).second(0);
    let tomorrow = today.add(1, 'day');
    let day = today.day();
    let saturday = dayjs()
      .add(6 - day, 'day')
      .hour(0)
      .second(0);
    let sunday = saturday.add(1, 'day');

    // loop through events and log them
    for (const event of Object.values(events)) {
      if (event.type == 'VEVENT') {
        let start = dayjs(event.start).hour(0).minute(0).second(0);
        let end = dayjs(event.end).hour(23).minute(59).second(59);
        let length = end.diff(start, 'day') + 1;
        let dayNumber = today.diff(start, 'day') + 1;
        let range = '';
        let url = '';
        let when = '';

        if (today >= start && today <= end) {
          start = dayjs(event.start);
          end = dayjs(event.end);

          switch (length) {
            case 1:
              range =
                'Today between ' +
                start.format('h:mma') +
                ' and ' +
                end.format('h:mma');
              break;

            default:
              switch (dayNumber) {
                case 1:
                  range = 'Starts today at ' + start.format('h:mma');
                  break;

                case length - 1:
                  range = 'Ends tomorrow at ' + end.format('h:mma');
                  break;

                case length:
                  range = 'Ends today at ' + end.format('h:mma');
                  break;

                default:
                  range = 'Day ' + dayNumber + ' of ' + length;
              }
          }
          when = 'today';
        } else if (tomorrow.isSame(start, 'day')) {
          start = dayjs(event.start);
          end = dayjs(event.end);

          switch (length) {
            case 1:
              range =
                'Tomorrow between ' +
                start.format('h:mma') +
                ' and ' +
                end.format('h:mma');
              break;

            default:
              range = 'Starts tomorrow at ' + start.format('h:mma');
          }
          when = 'tomorrow';
        } else if (saturday.isSame(start, 'day') && day > 0 && day < 5) {
          start = dayjs(event.start);
          end = dayjs(event.end);

          switch (length) {
            case 1:
              range =
                'Saturday between ' +
                start.format('h:mma') +
                ' and ' +
                end.format('h:mma');
              break;

            case 2:
              range =
                'Saturday from ' +
                start.format('h:mma') +
                ' to Sunday at ' +
                end.format('h:mma');
              break;
          }
          when = 'weekend';
        } else if (sunday.isSame(start, 'day') && day > 0 && day < 6) {
          start = dayjs(event.start);
          end = dayjs(event.end);

          switch (length) {
            case 1:
              range =
                'Sunday between ' +
                start.format('h:mma') +
                ' and ' +
                end.format('h:mma');
              break;
          }
          when = 'weekend';
        }

        if (range) {
          let matches = event.description.match(
            /https:\/\/pokemongolive.com\/.*\//gm
          );
          if (matches.length) {
            url = matches[0];
          }

          eventArray.push({
            start: event.start,
            summary: event.summary,
            range: range,
            url: url,
            when: when,
          });
        }
      }
    }
  }

  // order the array
  return eventArray.sort((a, b) => {
    if (a.when == b.when) {
      return a.start > b.start ? 1 : a.start < b.start ? -1 : 0;
    }
    return a.when.localeCompare(b.when);
  });
};

const getTodayText = async () => {
  const results = await getToday();

  const whenText = {
    today: 'TODAY',
    tomorrow: 'TOMORROW',
    weekend: 'THIS WEEKEND',
  };

  let text = '';
  let when = '';
  results.forEach((result) => {
    text = text == '' ? '' : text + '\n';
    if (result.when != when) {
      text = text + '**__' + whenText[result.when] + '__**\n\n';
    }

    text =
      text +
      '**' +
      result.summary +
      '**\n' +
      result.range +
      '\n' +
      result.url +
      '\n';

    when = result.when;
  });
  if (text == '') {
    text = 'Nothing going on down today!';
  }

  return text;
};

module.exports = {
  getToday,
  getTodayText,
};
