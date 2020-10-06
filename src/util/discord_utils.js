const moment = require('moment'); // require

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

const makeTable = (table, align = []) => {
  let data = [];

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
    if (text.length > 1600) {
      text += '```';
      data.push(text);
      text = '';
    }
    text += text == '' ? '```' : '\n';
    row.forEach((e, i) => {
      if (align[i] && align[i] == 'r') {
        text += e.padStart(width[i], ' ') + '  ';
      } else {
        text += e.padEnd(width[i] + 2, ' ');
      }
    });
    if (i == 0) {
      text += '\n';
      width.forEach((w) => {
        text += ''.padEnd(w, '=') + '  ';
      });
    }
  });

  text += '```';
  data.push(text);

  return data;
};

const findUser = (client, name) => {
  let user = client.users.find(
    (u) => u.username.toLowerCase() === name.toLowerCase()
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

const decodeMeowthText = async (client, text) => {
  const regEx = /(.*) (is .*|has .*|needs .*)/g;
  const search = regEx.exec(text);

  if (search && search.length == 3) {
    const user = await findUser(client, search[1]);

    if (user === null) {
      console.log("Can't find user: " + search[1] + ' (' + text + ')');
      return null;
    }

    return {
      text: text,
      userId: user.id,
      userName: user.username,
      interested: search[2].indexOf('interested') != -1,
      coming: search[2].indexOf('on the way') != -1,
      here: search[2].indexOf('at the raid') != -1,
      cancelled: search[2].indexOf('cancel') != -1,
      invite: search[2].indexOf('invite') != -1,
      remote: search[2].indexOf('remotely') != -1,
    };
  }

  return null;
};

const suggestTags = async (client, msg, gymId) => {
  client.pool
    .query(
      "SELECT DISTINCT rc.gym_id, m.role_id FROM dex_raidcreate rc JOIN dex_mentions m ON m.channel_id = rc.channel_id WHERE rc.gym_id = '" +
        gymId +
        "'"
    )
    .then((results) => {
      if (results.length > 0) {
        let roles = [];
        results.forEach((r) => {
          if (client.config.discord.ignore_roles.indexOf(r.role_id) == -1) {
            let role = msg.guild.roles.get(r.role_id);
            if (role) {
              roles.push('`@' + role.name + '`');
            }
          }
        });
        if (
          roles.length > 0 &&
          client.watching[msg.channel.id].message === null
        ) {
          let text =
            "To see if there's interest, suggested tags you could use are:\n" +
            roles.join('\n');
          client.watching[msg.channel.id].message = msg.channel.send(text);
        }
      }
    });
};

const processMeowthMessage = async (client, msg) => {
  if (msg.embeds.length > 0) {
    msg.embeds.forEach((embed) => {
      // log who created the channel, start and end times
      if (
        client.watching[msg.channel.id] &&
        client.watching[msg.channel.id].userId === null &&
        embed.footer
      ) {
        let regEx = /by (.*) • /gm;
        let search = regEx.exec(embed.footer.text);

        if (search && search[1]) {
          let reporter = client.discordUtils.findUser(client, search[1]);
          if (reporter && reporter.id) {
            console.log(
              msg.id +
                ' User recognised: ' +
                search[1] +
                ' (' +
                reporter.id +
                ')'
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
      } else if (embed.footer) {
        let regEx = /Hatches at (.* [PA]M)/gm;
        const hatches = regEx.exec(embed.footer.text);
        if (hatches && hatches[1]) {
          client.pool.query(
            "UPDATE dex_raidcreate SET `start` = '" +
              moment(
                moment().format('YYYY-MM-DD') + ' ' + hatches[1],
                'YYYY-MM-DD hh:mm A'
              ).format('YYYY-MM-DD HH:mm:ss') +
              "' WHERE `channel_id` = '" +
              msg.channel.id +
              "'"
          );
        }

        regEx = /Ends at (.* [PA]M)/gm;
        const ends = regEx.exec(embed.footer.text);
        if (ends && ends[1]) {
          client.pool.query(
            "UPDATE dex_raidcreate SET `end` = '" +
              moment(
                moment().format('YYYY-MM-DD') + ' ' + ends[1],
                'YYYY-MM-DD hh:mm A'
              ).format('YYYY-MM-DD HH:mm:ss') +
              "' WHERE `channel_id` = '" +
              msg.channel.id +
              "'"
          );
        }
      }

      embed.fields.forEach(async (field) => {
        // check for the raid level
        if (
          field.name == 'Raid Level' &&
          client.watching[msg.channel.id].raid != 'Level ' + field.value
        ) {
          console.log(msg.id + ' Raid level recognised: Level ' + field.value);
          client.pool.query(
            'UPDATE dex_raidcreate SET `level` = ' +
              (field.value == 'Mega' ? 6 : parseInt(field.value)) +
              " WHERE `channel_id` = '" +
              msg.channel.id +
              "'"
          );

          client.watching[msg.channel.id].raid = 'Level ' + field.value;
        }

        // check for pokemon
        if (field.name == 'Boss') {
          let mon = field.value;
          const regEx = /([a-zA-Z\(\).\-' ]+) [<:]/gm;
          const boss = regEx.exec(mon);
          if (boss && boss[1]) {
            mon = boss[1];
          }
          const pokemon = client.monsterUtils.stringToMon(client, mon);

          if (pokemon && client.watching[msg.channel.id].raid != mon) {
            console.log(
              msg.id +
                ' Boss recognised: ' +
                mon +
                ' (' +
                pokemon.id +
                '/' +
                pokemon.form.id +
                ')'
            );
            client.pool.query(
              'UPDATE dex_raidcreate SET `pokemon_id` = ' +
                pokemon.id +
                ', `form_id` = ' +
                pokemon.form.id +
                " WHERE `channel_id` = '" +
                msg.channel.id +
                "'"
            );
          }

          client.watching[msg.channel.id].raid = mon;
        }

        // if the gym is recognised, notify everyones who's watching
        if (
          field.name == 'Gym' &&
          client.watching[msg.channel.id].gymId === null
        ) {
          const gymId = await client.gymUtils.findGym(client, field.value);
          const gymName = await client.gymUtils.gymName(client, gymId);

          if (gymId != -1) {
            console.log(
              msg.id + ' Gym recognised: ' + gymName + ' (' + gymId + ')'
            );
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
              let text = client.watching[msg.channel.id].raid
                ? client.watching[msg.channel.id].raid + ' r'
                : 'R';
              text +=
                'aid reported at ' + gymName + ' <#' + msg.channel.id + '>';
              if (client.watching[msg.channel.id].userName) {
                text = text + ' by ' + client.watching[msg.channel.id].userName;
              }
              results.forEach((r) => {
                client.fetchUser(r.user_id, false).then((user) => {
                  console.log(msg.id + ' Notifying: ' + user.username);
                  user.send(text);
                });
              });
            }

            suggestTags(client, msg, gymId);
          }
        }
      });
    });
  } else {
    let details = await decodeMeowthText(client, msg.content);

    if (details) {
      // track users expressing interest
      if (details.cancelled) {
        await client.pool.query(
          "DELETE FROM dex_interest WHERE channel_id = '" +
            msg.channel.id +
            "' AND user_id = '" +
            details.userId +
            "'"
        );
      } else {
        await client.pool.query(
          "INSERT IGNORE INTO dex_interest (`channel_id`,`user_id`) VALUES ('" +
            msg.channel.id +
            "','" +
            details.userId +
            "')"
        );
      }

      // notify everyone who wants notifying
      let text = details.text + ' <#' + msg.channel.id + '>';

      client.watching[msg.channel.id].userIds.forEach((id) => {
        client.fetchUser(id, false).then((user) => {
          console.log(msg.id + ' Notifying: ' + user.username);
          user.send(text);
        });
      });
    }
  }
};

const userSelect = async (client, msg, rows, id, name, prompt = '') => {
  let selectId = -1;

  if (rows.length == 1) {
    selectId = rows[0][id];
  } else if (rows.length > 1 && rows.length < client.emoji.length) {
    let text = '';
    if (prompt != '') {
      text = text + prompt + '\n\n';
    }
    rows.forEach((r, i) => {
      text = text + client.emoji[i] + ': ' + r[name] + '\n';
    });
    text = text + client.emojiQ + ': Unknown';

    const message = await msg.reply({ embed: { description: text } });
    await client.asyncForEach(rows, async (r, i) => {
      await message.react(client.emoji[i]);
    });
    await message.react(client.emojiQ);

    await message
      .awaitReactions(
        (reaction, user) =>
          user.id == msg.author.id &&
          ((client.emoji.indexOf(reaction.emoji.name) >= 0 &&
            client.emoji.indexOf(reaction.emoji.name) < rows.length) ||
            reaction.emoji.name == client.emojiQ),
        { max: 1, time: 30000 }
      )
      .then((collected) => {
        if (client.emoji.indexOf(collected.first().emoji.name) >= 0) {
          selectId =
            rows[client.emoji.indexOf(collected.first().emoji.name)][id];
        }
        message.delete();
      })
      .catch(() => {
        message.delete();
      });
  }

  return selectId;
};

const argOption = (args, option) => {
  if (args.indexOf(option) >= 0 || args.indexOf('+' + option) >= 0) {
    return true;
  }
  if (args.indexOf('!' + option) >= 0 || args.indexOf('-' + option) >= 0) {
    return false;
  }
  return null;
};

// go through any role mentions and add them to the database
const processMentions = async (client, msg) => {
  let regex = /<@&([0-9]*)>/gm;
  let result = 0;

  while ((result = regex.exec(msg.content))) {
    let sql =
      "INSERT INTO dex_mentions (channel_id, user_id, role_id) VALUES ('" +
      msg.channel.id +
      "','" +
      msg.author.id +
      "','" +
      result[1] +
      "')";

    await client.pool.query(sql);
  }
};

// delete expired notifications
const tidyChannel = (channel) => {
  channel.fetchMessages({ limit: 99 }).then((fetched) => {
    fetched.forEach((msg) => {
      if (msg.embeds.length > 0) {
        msg.embeds.forEach((embed) => {
          if (embed.footer) {
            const elements = embed.footer.text.split(' ');
            const endTime = moment(elements.pop(), 'HH:mm:ss');
            if (endTime.isBefore()) {
              msg.delete().catch((err) => {
                // message already deleted
              });
            }
          }
        });
      }
    });
  });
};

module.exports = {
  msgAdmin,
  msgEmbed,
  msgError,
  msgOk,
  makeTable,
  findUser,
  processMeowthMessage,
  userSelect,
  argOption,
  processMentions,
  tidyChannel,
};
