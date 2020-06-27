exports.run = async (client, msg, args) => {
  const nests = await client.nestUtils.getNestText(client);

  await client.asyncForEach(nests, async (n, i) => {
    await msg.channel.send(n.text);
  });
};
