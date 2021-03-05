const getTodayText = require('../util/calendar').getTodayText;

exports.run = async (client, msg, args) => {
  const text = await getTodayText(args.length > 0 ? args[0] : null);

  msg.reply({ embed: { description: text } });
};
