const ical = require('node-ical');
const dayjs = require('dayjs');

const getToday = async () => {
  let eventArray = [];

  const events = await ical.async.fromURL(
    'https://calendar.google.com/calendar/ical/l7c9u0a3n2fsvl2kknmecvnp38%40group.calendar.google.com/public/basic.ics'
  );

  if (events) {
    let today = dayjs().hour(0).minute(0).second(0);
    let tomorrow = dayjs().add(1, 'day').hour(0).minute(0).second(0);

    // loop through events and log them
    for (const event of Object.values(events)) {
      if (event.type == 'VEVENT') {
        let start = dayjs(event.start).hour(0).minute(0).second(0);
        let end = dayjs(event.end).hour(23).minute(59).second(59);
        let length = end.diff(start, 'day') + 1;
        let dayNumber = today.diff(start, 'day') + 1;
        let range = '';
        let url = '';

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
        }

        if (range) {
          let matches = event.description.match(
            /https:\/\/pokemongolive.com\/.*\//gm
          );
          if (matches.length) {
            url = matches[0];
          }

          eventArray.push({
            summary: event.summary,
            range: range,
            url: url,
          });
        }
      }
    }
  }

  return eventArray;
};

module.exports = {
  getToday,
};
