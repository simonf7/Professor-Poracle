const ical = require('node-ical');
const dayjs = require('dayjs');
const fetch = require('node-fetch');

const downloadJson = async (url, today) => {
  const response = await fetch(url);
  let eventJson = await response.json();
  let eventData = [];

  eventJson.forEach((event) => {
    if (event.start) {
      let start = dayjs(event.start);
      let end = event.end ? dayjs(event.end) : dayjs(event.start);

      if (end >= today) {
        eventData.push({
          start: start.format('YYYY-MM-DD HH:mm'),
          end: end.format('YYYY-MM-DD HH:mm'),
          summary: event.name,
          link: null,
          bonuses: event.bonuses.map((b) => {
            return b.text;
          }),
          features: event.features,
          type: event.type,
        });
      }
    }
  });

  return eventData;
};

const downloadiCal = async (url, today) => {
  let eventData = [];

  const events = await ical.async.fromURL(url);

  if (events) {
    // loop through events and log them
    for (const event of Object.values(events)) {
      if (event.type == 'VEVENT') {
        let start = dayjs(event.start);
        let end = event.end ? dayjs(event.end) : dayjs(event.start);

        // handle weekly events
        if (
          event.rrule &&
          event.rrule.options &&
          event.rrule.options.freq == 2
        ) {
          while (start < today) {
            start = start.add(event.rrule.options.interval, 'week');
            end = end.add(event.rrule.options.interval, 'week');
          }
        }

        if (end >= today) {
          let link = '';
          let matches = event.description.match(
            /https:\/\/pokemongolive.com\/.*\//gm
          );
          if (matches && matches.length) {
            link = matches[0];
          }

          let type = 'event';
          if (event.summary.indexOf('Community Day') != -1) {
            type = 'community-day';
          }
          if (event.summary.indexOf('Spotlight Hour') != -1) {
            type = 'spotlight-hour';
          }
          if (event.summary.indexOf('Raid Hour') != -1) {
            type = 'raid-hour';
          }
          if (event.summary.indexOf('5* Raids') != -1) {
            type = 'raid-boss';
          }

          eventData.push({
            start: start.format('YYYY-MM-DD HH:mm'),
            end: end.format('YYYY-MM-DD HH:mm'),
            summary: event.summary,
            link: link,
            bonuses: [],
            features: [],
            type: type,
          });
        }
      }
    }
  }

  return eventData;
};

const mergeEvents = (events1, events2) => {
  let merged = [];

  events1.forEach((event) => {
    let matches = events2.filter((e) => {
      return (
        event.start == e.start && event.end == e.end && event.type == e.type
      );
    });

    let match = {};
    if (matches.length > 0) {
      match = matches.shift();
    }

    if (match) {
      for (const [key, value] of Object.entries(event)) {
        if (value === null) {
          event[key] = match[key];
        }
      }
    }

    merged.push(event);
  });

  events2.forEach((event) => {
    let matches = events1.filter((e) => {
      return (
        event.start == e.start && event.end == e.end && event.type == e.type
      );
    });

    if (matches.length == 0) {
      merged.push(event);
    }
  });

  return merged;
};

const getToday = async (arg = null) => {
  let eventArray = [];
  let today = dayjs().hour(0).minute(0).second(0);
  if (arg) {
    today = dayjs(arg).hour(0).minute(0).second(0);
  }

  let iCalEvents = await downloadiCal(
    'https://calendar.google.com/calendar/ical/7k10p0us773fujdvf1ud4v3a0g%40group.calendar.google.com/public/basic.ics',
    today
  );

  // let iCalEvents = await downloadiCal(
  //   'https://calendar.google.com/calendar/ical/l7c9u0a3n2fsvl2kknmecvnp38%40group.calendar.google.com/public/basic.ics'
  //   today
  // );

  let jsonEvents = await downloadJson(
    'https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/events.json',
    today
  );

  let events = mergeEvents(jsonEvents, iCalEvents);

  if (events) {
    const tomorrow = today.add(1, 'day');
    const day = today.day();
    const saturday = today
      .add(6 - day, 'day')
      .hour(0)
      .second(0);
    const sunday = saturday.add(1, 'day');

    // loop through events and log them
    events.forEach((event) => {
      let start = dayjs(event.start);
      let end = event.end ? dayjs(event.end) : dayjs(event.start);
      let length =
        end
          .hour(23)
          .minute(59)
          .second(59)
          .diff(start.hour(0).minute(0).second(0), 'day') + 1;
      let dayNumber = today.diff(start.hour(0).minute(0).second(0), 'day') + 1;
      let range = '';
      let url = event.link;
      let when = '';

      if (
        today >= start.hour(0).minute(0).second(0) &&
        today <= end.hour(23).minute(59).second(59)
      ) {
        switch (length) {
          case 1:
            if (event.end) {
              range =
                'Today between ' +
                start.format('h:mma') +
                ' and ' +
                end.format('h:mma');
            } else {
              range = 'Starts today at ' + start.format('h:mma');
            }
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
        switch (length) {
          case 1:
            if (event.end) {
              range =
                'Tomorrow between ' +
                start.format('h:mma') +
                ' and ' +
                end.format('h:mma');
            } else {
              range = 'Starts tomorrow at ' + start.format('h:mma');
            }
            break;

          default:
            range = 'Starts tomorrow at ' + start.format('h:mma');
        }
        when = 'tomorrow';
      } else if (saturday.isSame(start, 'day') && day > 0 && day < 5) {
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
        eventArray.push({
          start: event.start,
          summary: event.summary,
          range: range,
          url: url,
          when: when,
          bonuses: event.bonuses,
          features: event.features,
        });
      }
    });
  }

  // order the array
  return eventArray.sort((a, b) => {
    if (a.when == b.when) {
      return a.start > b.start ? 1 : a.start < b.start ? -1 : 0;
    }
    return a.when.localeCompare(b.when);
  });
};

const getTodayText = async (arg = null) => {
  const results = await getToday(arg);

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

    text = text + '**' + result.summary + '**\n' + result.range + '\n';

    if (result.bonuses) {
      result.bonuses.forEach((bonus) => {
        text = text + '- ' + bonus + '\n';
      });
    }

    if (result.url) {
      text = text + result.url + '\n';
    }

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
