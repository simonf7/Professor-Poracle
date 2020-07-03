exports.run = async (client, msg, args) => {
  const nestChannel = client.channels.get(client.config.discord.nests.channel);
  const options = {
    scanned:
      client.discordUtils.argOption(args, 'scanned') !== null
        ? client.discordUtils.argOption(args, 'scanned')
        : await client.utils.getSetting(
            client,
            'nests_scanned',
            client.config.discord.nests.scanned
          ),
    links:
      client.discordUtils.argOption(args, 'links') !== null
        ? client.discordUtils.argOption(args, 'links')
        : await client.utils.getSetting(
            client,
            'nests_links',
            client.config.discord.nests.links
          ),
    compare: client.discordUtils.argOption(args, 'compare'),
  };

  const pleaseWait = await msg.reply('Please wait... Updating...');

  client.nestUtils.getNestText(client, options).then(async (nests) => {
    // do we have message ids?
    let update = args.length > 0 && args[0] == 'force' ? false : true;
    nests.forEach((n) => {
      if (n.messageId === null && n.nests !== null) {
        update = false;
      }
    });

    if (update) {
      await client.asyncForEach(nests, async (n) => {
        if (n.messageId !== null) {
          let message = await nestChannel.fetchMessage(n.messageId);
          if (options.links && n.nests && Array.isArray(n.nests)) {
            await message.edit(client.discordUtils.msgEmbed(n.text));
          } else {
            await message.edit(n.text);
          }
        }
      });
    } else {
      // delete the bots messages
      const fetched = await nestChannel.fetchMessages({ limit: 99 });
      const mine = fetched.filter(
        (fetchedMsg) => fetchedMsg.author.id == client.user.id
      );
      mine.forEach((m) => {
        m.delete();
      });

      // repost
      await client.asyncForEach(nests, async (m, i) => {
        let message = null;
        if (options.links && m.nests && Array.isArray(m.nests)) {
          message = await nestChannel.send(
            client.discordUtils.msgEmbed(m.text)
          );
        } else {
          message = await nestChannel.send(m.text);
        }

        // keep track of which messages a nest is in
        if (m.nests) {
          if (Array.isArray(m.nests)) {
            await client.asyncForEach(m.nests, async (n) => {
              await client.pool.query(
                "UPDATE dex_nests SET message_id = '" +
                  message.id +
                  "' WHERE id = " +
                  n.id
              );
            });
          } else {
            await client.utils.setSetting(client, m.nests, message.id);
          }
        }
      });
    }

    pleaseWait.delete();
    msg.reply(client.discordUtils.msgOk('Nests updated'));
  });
};
