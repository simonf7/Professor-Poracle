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
          await message.edit(n.text);
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
        let message = await nestChannel.send(m.text);

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

    // tidy up messages
    const fetched = await nestChannel.fetchMessages({ limit: 99 });
    const others = fetched.filter(
      (fetchedMsg) => fetchedMsg.author.id != client.user.id
    );
    others.forEach((m) => {
      m.delete();
    });

    pleaseWait.delete();

    msg.reply(client.discordUtils.msgOk('Nests updated')).then((message) => {
      // auto delete the confirmation after 10 seconds
      setTimeout(() => {
        message.delete();
      }, 10000);
    });
  });
};
