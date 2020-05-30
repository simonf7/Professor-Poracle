const msgAdmin = async (client, msg) => {
  client.config.discord.admin.forEach((id) => {
    client.fetchUser(id, false).then((user) => {
      console.log('Notifying: ' + user.username);
      user.send(msg);
    });
  });
};

const msgEmbed = (msg) => {
  return { embed: { description: msg } };
};

const msgError = (msg) => {
  return {
    embed: { description: ':rotating_light:  ' + msg, color: 15158332 },
  };
};

const msgOk = (msg) => {
  return {
    embed: { description: ':white_check_mark:  ' + msg, color: 3066993 },
  };
};

const showTable = (table, align = []) => {
  let width = [];
  table.forEach((row) => {
    row.forEach((e, i) => {
      if ((width[i] && width[i] < e.length) || !width[i]) {
        width[i] = e.length;
      }
    });
  });
  let text = '';
  table.forEach((row, i) => {
    text = text + (i == 0 ? '```' : '\n');
    row.forEach((e, i) => {
      if (align[i] && align[i] == 'r') {
        text = text + e.padStart(width[i], ' ') + '  ';
      } else {
        text = text + e.padEnd(width[i] + 2, ' ');
      }
    });
    if (i == 0) {
      text = text + '\n';
      width.forEach((w) => {
        text = text + ''.padEnd(w, '=') + '  ';
      });
    }
  });

  text = text + '```';

  return text;
};

const findUser = (client, name) => {
  let user = client.users.find(
    (user) => user.username.toLowerCase() === name.toLowerCase()
  );

  if (user === null) {
    client.guilds.forEach((g) => {
      g.members.forEach((m) => {
        if (m.nickname && m.nickname.toLowerCase() === name.toLowerCase()) {
          user = m.user;
        }
      });
    });
  }

  return user;
};

const processMeowthPinned = async (client, msg) => {
  msg.embeds.forEach((embed) => {
    if (client.watching[msg.channel.id].userId === null) {
      const regEx = /by (.*) • Ends/gm;
      const search = regEx.exec(embed.footer.text);
      if (search && search[1]) {
        let reporter = client.discordUtils.findUser(client, search[1]);
        if (reporter && reporter.id) {
          console.log(
            'User recognised: ' + search[1] + ' (' + reporter.id + ')'
          );
          client.watching[msg.channel.id].userId = reporter.id;
          client.watching[msg.channel.id].userName = search[1];

          client.pool.query(
            "UPDATE dex_raidcreate SET `user_id` = '" +
              reporter.id +
              "' WHERE `channel_id` = '" +
              msg.channel.id +
              "'"
          );
        }
      }
    }

    if (client.watching[msg.channel.id].gymId === null) {
      embed.fields.forEach(async (field) => {
        if (field.name == 'Gym') {
          const gymId = await client.gymUtils.findGym(client, field.value);
          const gymName = await client.gymUtils.gymName(client, gymId);

          if (gymId != -1) {
            console.log('Gym recognised: ' + gymName + ' (' + gymId + ')');
            client.watching[msg.channel.id].gymId = gymId;
            client.watching[msg.channel.id].gymName = gymName;

            client.pool.query(
              "UPDATE dex_raidcreate SET `gym_id` = '" +
                gymId +
                "' WHERE `channel_id` = '" +
                msg.channel.id +
                "'"
            );

            const results = await client.pool.query(
              "SELECT user_id FROM dex_users WHERE gym_id='" + gymId + "'"
            );
            if (results.length > 0) {
              let text =
                'Raid reported at ' + gymName + ' <#' + msg.channel.id + '>';
              if (client.watching[msg.channel.id].userName) {
                text = text + ' by ' + client.watching[msg.channel.id].userName;
              }
              results.forEach((r) => {
                client.fetchUser(r.user_id, false).then((user) => {
                  console.log('Notifying: ' + user.username);
                  user.send(text);
                });
              });
            }
          }
        }
      });
    }
  });
};

module.exports = {
  msgAdmin,
  msgEmbed,
  msgError,
  msgOk,
  showTable,
  findUser,
  processMeowthPinned,
};
