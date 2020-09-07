const execSync = require('child_process').execSync;

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

  let pleaseWait = null;
  if (msg) {
    pleaseWait = await msg.reply('Please wait... Updating...');
  } else {
    client.discordUtils.msgAdmin(client, 'Updating nests...');
  }

  client.nestUtils.getNestText(client, options).then(async (nests) => {
    // do we have message ids?
    let update = client.discordUtils.argOption(args, 'force') !== true;
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

    // tidy up messages - only delete commands
    const fetched = await nestChannel.fetchMessages({ limit: 99 });
    const others = fetched.filter(
      (fetchedMsg) =>
        fetchedMsg.author.id != client.user.id &&
        (fetchedMsg.content.startsWith(client.config.discord.prefix) ||
          client.discordUtils.argOption(args, 'tidy') === true)
    );
    others.forEach((m) => {
      m.delete();
    });

    if (pleaseWait) {
      pleaseWait.delete();

      msg.reply(client.discordUtils.msgOk('Nests updated')).then((message) => {
        // auto delete the confirmation after 10 seconds
        setTimeout(() => {
          message.delete();
        }, 10000);
      });
    } else {
      client.discordUtils.msgAdmin(
        client,
        client.discordUtils.msgOk('Nests updated!')
      );
    }

    const updateScript = await client.utils.getSetting(
      client,
      'nests_update_script'
    );
    if (updateScript) {
      const output = execSync(updateScript, { encoding: 'utf-8' }); // the default is 'buffer'
      console.log(updateScript, ' >\n', output);
    }
  });
};
