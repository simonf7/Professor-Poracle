exports.run = async (client, msg, args) => {
  console.log(client.discordUtils.findUser(client, args[0]));
};
