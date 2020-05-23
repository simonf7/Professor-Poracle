exports.run = async (client, msg, args) => {
  const results = await client.pool.query(
    "SELECT name FROM dex_users LEFT JOIN gymdetails ON gymdetails.gym_id = dex_users.gym_id WHERE user_id = '" +
      msg.author.id +
      "'"
  );

  let text = '';
  results.forEach((result) => {
    text = text + result.name + '\n';
  });
  if (text == '') {
    text = 'None';
  }

  msg.reply({ embed: { description: text } });
};
