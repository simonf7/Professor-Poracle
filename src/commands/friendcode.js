exports.run = async (client, msg, args) => {
  const friendCode = args.join('').match(/\d{16}/gm);

  if (!friendCode) {
    return;
  }

  console.log('Friendcode: ' + msg.author.id + ' -> ' + friendCode[0]);
  await client.pool.query(
    "INSERT INTO dex_friendcodes (`user_id`, `friend_code`) VALUES ('" +
      msg.author.id +
      "','" +
      friendCode[0] +
      "') ON DUPLICATE KEY UPDATE friend_code = '" +
      friendCode[0] +
      "'"
  );
};

exports.aliases = () => {
  return ['fc'];
};
