const getTodayText = require('../util/calendar').getTodayText;

exports.run = async (client, msg, args) => {
  const text = await getTodayText();

  msg.reply({ embed: { description: text } });
};
