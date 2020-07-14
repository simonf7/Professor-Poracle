const moment = require('moment'); // require

const nestName = async (client, nest_id) => {
  const result = await client.pool.query(
    "SELECT name FROM dex_nests WHERE id = '" + nest_id + "'"
  );
  if (result.length == 1) {
    return result[0].name;
  }

  return 'Unknown';
};

const selectNest = async (client, msg, args, prompt = '') => {
  args = args.filter((arg) => arg.length > 2);
  if (args.length == 0) {
    return -1;
  }
  args = args.map((arg) => "`name` LIKE '%" + arg.replace("'", "\\'") + "%'");

  const rows = await client.pool.query(
    'SELECT id, name FROM dex_nests WHERE ' + args.join(' AND ')
  );

  let nestId = await client.discordUtils.userSelect(
    client,
    msg,
    rows,
    'id',
    'name',
    prompt
  );

  return nestId;
};

const areaName = async (client, area_id) => {
  const result = await client.pool.query(
    "SELECT name FROM dex_areas WHERE id = '" + area_id + "'"
  );
  if (result.length == 1) {
    return result[0].name;
  }

  return 'Unknown';
};

const selectArea = async (client, msg, prompt = '') => {
  const rows = await client.pool.query(
    'SELECT id, name FROM dex_areas ORDER BY name'
  );

  let areaId = await client.discordUtils.userSelect(
    client,
    msg,
    rows,
    'id',
    'name',
    prompt
  );

  return areaId;
};

const getNestText = async function (client, options = {}) {
  const scanned = options.scanned == true || options.scanned == 'true';
  const compare = options.compare == true || options.compare == 'true';
  const links = options.links == true || options.links == 'true';

  let sql = '';
  if (scanned) {
    sql =
      "SELECT dex_nests.id, dex_nests.name, if(isnull(dex_nests.lat), nests.lat, dex_nests.lat) AS lat, if(isnull(dex_nests.lon), nests.lon, dex_nests.lon) AS lon, if(dex_nests.pokemon_id = 0, 'no', 'yes') as reported, if(dex_nests.pokemon_id = 0, if(nests.pokemon_id = 443, 0, nests.pokemon_id), dex_nests.pokemon_id) AS pokemon_id, nests.pokemon_id AS scanned_id, dex_nests.message_id, dex_areas.id AS area_id, dex_areas.name AS area_name FROM dex_nests LEFT JOIN dex_areas ON dex_areas.id = dex_nests.area_id LEFT JOIN nests ON nests.name = dex_nests.name";
  } else {
    sql =
      "SELECT dex_nests.id, dex_nests.name, if(isnull(dex_nests.lat), nests.lat, dex_nests.lat) AS lat, if(isnull(dex_nests.lon), nests.lon, dex_nests.lon) AS lon, 'yes' as reported, dex_nests.pokemon_id AS pokemon_id, nests.pokemon_id AS scanned_id, dex_nests.message_id, dex_areas.id AS area_id, dex_areas.name AS area_name FROM dex_nests LEFT JOIN dex_areas ON dex_areas.id = dex_nests.area_id LEFT JOIN nests ON nests.name = dex_nests.name";
  }
  sql += ' ORDER BY dex_areas.sort, dex_areas.name, dex_nests.name';

  return client.pool.query(sql).then(async (rows) => {
    let text = '';
    let lastArea = '';
    let results = [];
    let nests = [];
    let count = 0;
    let messageIds = [];

    if (!Array.isArray(options.ids)) {
      results.push({
        text:
          'Next migration: ' +
          (await getNextMigration(client)).format('dddd, Do MMMM YYYY') +
          '\n',
        messageId: await client.utils.getSetting(client, 'nest_migration_msg'),
        nests: 'nest_migration_msg',
      });
    }

    rows.forEach((r) => {
      count += 1;
      if (count == 20 && !Array.isArray(options.ids)) {
        results.push({
          text: links ? client.discordUtils.msgEmbed(text) : text,
          messageId: messageIds.length == 1 ? messageIds[0] : null,
          nests: nests,
        });
        text = '';
        nests = [];
        count = 0;
        messageIds = [];
      }

      text += text === '' ? '' : '\n';
      if (lastArea !== r.area_name) {
        text += '__**' + r.area_name + '**__\n';
      }
      if (links && r.lat && r.lon) {
        text +=
          '[' +
          r.name +
          '](https://pogonorwich.co.uk/?lat=' +
          r.lat +
          '&lon=' +
          r.lon +
          '&zoom=16): ';
      } else {
        text += r.name + ': ';
      }

      nests.push({ id: r.id, message_id: r.message_id });

      if (messageIds.indexOf(r.message_id) == -1) {
        messageIds.push(r.message_id);
      }

      if (r.pokemon_id > 0) {
        if (client.poke_names[r.pokemon_id]) {
          let shiny = client.poke_names[r.pokemon_id]['shiny'];
          if (shiny) {
            text += ':sparkles: ';
          }
          text = text + '**' + client.poke_names[r.pokemon_id]['en'] + '**';
          if (shiny) {
            text += ' :sparkles:';
          }
          if (scanned && r.reported == 'no') {
            text += ' *(unconfirmed)*';
          }
        }
        if (compare && r.scanned_id > 0) {
          if (
            client.poke_names[r.scanned_id] &&
            (r.pokemon_id == 0 || r.reported == 'yes')
          ) {
            text +=
              ' *(scanned: ' + client.poke_names[r.scanned_id]['en'] + ')*';
          }
        }
      }

      lastArea = r.area_name;
    });

    if (text) {
      results.push({
        text: links ? client.discordUtils.msgEmbed(text) : text,
        messageId: messageIds.length == 1 ? messageIds[0] : null,
        nests: nests,
      });
    }

    if (!Array.isArray(options.ids)) {
      let notes = await client.utils.getSetting(client, 'nest_notes');
      if (notes) {
        results.push({
          text: notes,
          messageId: await client.utils.getSetting(client, 'nest_notes_msg'),
          nests: 'nest_notes_msg',
        });
      }

      let last = await getLastUpdate(client);
      results.push({
        text:
          ' \nList updated: **' +
          (last === null ? '-' : moment(last).format('dddd, Do MMMM YYYY')) +
          '**',
        messageId: await client.utils.getSetting(client, 'nest_last_msg'),
        nests: 'nest_last_msg',
      });
    }

    return results;
  });
};

const getNextMigration = async function (client) {
  let next = moment(client.config.discord.nests.migration);
  while (
    next.set({ hour: 0, minute: 0 }) <= moment().set({ hour: 0, minute: 0 })
  ) {
    next.add(2, 'weeks');
  }
  return next;
};

const getLastMigration = async function (client) {
  return getNextMigration.add(-2, 'weeks');
};

const getLastUpdate = async function (client) {
  return client.pool
    .query('SELECT MAX(last_update) AS last FROM dex_nests')
    .then((res) => {
      if (res.length == 1) {
        return res[0].last;
      }

      return null;
    });
};

module.exports = {
  nestName,
  selectNest,
  areaName,
  selectArea,
  getNestText,
  getNextMigration,
  getLastMigration,
  getLastUpdate,
};
