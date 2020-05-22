exports.run = async (client, msg, args) => {
  const gymId = await client.gymUtils.selectGym(client, msg, args);

  if (gymId != -1) {
    let operation = '';
    const current = await client.pool.query(
      "SELECT * FROM dex_users WHERE `user_id`='" +
        msg.author.id +
        "' AND `gym_id`='" +
        gymId +
        "'"
    );
    if (current.length > 0) {
      const result = await client.pool.query(
        "DELETE FROM dex_users WHERE `user_id`='" +
          msg.author.id +
          "' AND `gym_id`='" +
          gymId +
          "'"
      );
      operation = '-';
    } else {
      const result = await client.pool.query(
        "INSERT INTO dex_users (`user_id`, `gym_id`) VALUES ('" +
          msg.author.id +
          "','" +
          gymId +
          "')"
      );
      operation = '+';
    }
    const text = operation + (await client.gymUtils.gymName(client, gymId));

    msg.reply({ embed: { description: text } });
  }
};

exports.aliases = () => {
  return ['watch'];
};
