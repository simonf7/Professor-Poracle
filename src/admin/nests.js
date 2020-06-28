exports.run = async (client, msg, args) => {
  const options = {
    scanned: client.discordUtils.argOption(args, 'scanned')
      ? client.discordUtils.argOption(args, 'scanned')
      : await client.utils.getSetting(
          client,
          'nests_scanned',
          client.config.discord.nests.scanned
        ),
    links: client.discordUtils.argOption(args, 'links')
      ? client.discordUtils.argOption(args, 'links')
      : await client.utils.getSetting(
          client,
          'nests_links',
          client.config.discord.nests.links
        ),
    compare: client.discordUtils.argOption(args, 'compare'),
  };

  console.log(options);

  const nests = await client.nestUtils.getNestText(client, options);

  await client.asyncForEach(nests, async (n, i) => {
    await msg.channel.send(n.text);
  });
};
