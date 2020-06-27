exports.run = async (client, msg, args) => {
  const nestChannel = client.channels.get(client.config.discord.nests.channel);

  client.nestUtils.getNestText(client).then(async (nests) => {
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

    msg.reply(client.discordUtils.msgOk('Nests updated'));
  });
};
