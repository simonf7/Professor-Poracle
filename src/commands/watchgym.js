exports.run = async (client, msg, args) => {
  const gymId = await client.gymUtils.selectGym(client, msg, args);

  if (gymId != -1) {
    const gymName = await client.gymUtils.gymName(client, gymId);
    let operation = '';
    const current = await client.pool.query(
      "SELECT * FROM dex_users WHERE `user_id`='" +
        msg.author.id +
        "' AND `gym_id`='" +
        gymId +
        "'"
    );
    if (current.length > 0) {
      await client.pool.query(
        "DELETE FROM dex_users WHERE `user_id`='" +
          msg.author.id +
          "' AND `gym_id`='" +
          gymId +
          "'"
      );
      operation = 'No longer watching';
    } else {
      await client.pool.query(
        "INSERT INTO dex_users (`user_id`, `gym_id`) VALUES ('" +
          msg.author.id +
          "','" +
          gymId +
          "')"
      );
      operation = 'Now watching';
    }
    const text = ':white_check_mark: ' + operation + ': ' + gymName;

    msg.reply({ embed: { description: text } });
    console.log(`${msg.author.username} ${operation.toLowerCase()} ${gymName}`);
  }
};

exports.aliases = () => {
  return ['watch'];
};
