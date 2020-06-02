exports.run = async (client, msg, args) => {
  msg.reply(
    client.discordUtils.msgEmbed(await client.nestUtils.getNestText(client))
  );
};
