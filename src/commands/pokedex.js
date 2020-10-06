const fetch = require('node-fetch');
const pokemonGif = require('pokemon-gif');
const typeData = require('../../config/types.json');
exports.run = async (client, msg, args) => {
  args = args.map((arg) => arg.replace(/alol.*/gi, 'formalola'));
  args = args.map((arg) => arg.replace(/gala.*/gi, 'formgalarian'));
  args = args.map((arg) => arg.replace(/origi.*/gi, 'formorigin'));

  const formNames = args
    .filter((arg) => arg.match(/form\S/gi))
    .map((arg) => arg.replace('form', ''));

  try {
    // find the target pokemon
    let monsters = formNames.length
      ? Object.values(client.monsters).filter((mon) => {
          if (formNames.includes(mon.form.name.toLowerCase())) {
            if (args.includes(mon.id.toString())) {
              return true;
            }
            let found = false;
            args.forEach((a) => {
              if (a.length > 3 && mon.name.toLowerCase().indexOf(a) == 0) {
                found = true;
              }
            });

            return found;
          }
          return false;
        })
      : Object.values(client.monsters).filter((mon) => {
          if (mon.form.id == 0) {
            if (args.includes(mon.id.toString())) {
              return true;
            }
            let found = false;
            args.forEach((a) => {
              if (a.length > 3 && mon.name.toLowerCase().indexOf(a) == 0) {
                found = true;
              }
            });

            return found;
          }
          return false;
        });

    // limit responces to 3 pokeman
    if (monsters.length > 3) monsters = monsters.slice(0, 3);

    let atk = 15;
    let def = 15;
    let sta = 15;
    let level = 40;
    let cp = null;
    let iv = null;

    args.forEach((arg) => {
      if (arg.match(/atk\d{1,2}/gi))
        atk = +arg.match(/atk\d{1,2}/gi)[0].replace(/atk/gi, '');
      else if (arg.match(/def\d{1,2}/gi))
        def = +arg.match(/def\d{1,2}/gi)[0].replace(/def/gi, '');
      else if (arg.match(/sta\d{1,2}/gi))
        sta = +arg.match(/sta\d{1,2}/gi)[0].replace(/sta/gi, '');
      else if (arg.match(/level\d{1,2}/gi))
        level = +arg.match(/level\d{1,2}/gi)[0].replace(/level/gi, '');
      else if (arg.match(/cp\d{1,4}/gi))
        cp = +arg.match(/cp\d{1,4}/gi)[0].replace(/cp/gi, '');
      else if (arg.match(/iv\d{1,4}/gi))
        iv = +arg.match(/iv\d{1,4}/gi)[0].replace(/iv/gi, '');
    });

    client.asyncForEach(monsters, async (mon) => {
      let { description, art_url } = client.descriptions.find(
        (desc) => desc.pkdx_id === mon.id
      );
      description = description ? description : '';
      art_url = art_url ? art_url : '';
      let types = mon.types.map((type) => type.name);
      let typeString = mon.types.map(
        (type) => `${typeData[type.name].emoji} ${type.name}`
      );
      const allWeakness = client.pokeTypes.getTypeWeaknesses.apply(null, types);
      let allStrenght = {};
      let superEffective = [];
      let ultraEffective = [];
      let superWeakness = [];
      let ultraWeakness = [];

      types.forEach((type) => {
        let strengths = client.pokeTypes.getTypeStrengths(type);
        Object.keys(strengths).forEach((type) => {
          if (strengths[type] > allStrenght[type] || !allStrenght[type])
            allStrenght[type] = strengths[type];
        });
      });

      let imgurl = `https://raw.githubusercontent.com/whitewillem/PogoAssets/resized/no_border/pokemon_icon_${mon.id
        .toString()
        .padStart(3, '0')}_${mon.form.id ? mon.form.id.toString() : '00'}.png`;
      let imgurlRes = await fetch(imgurl);
      for (let type in allStrenght) {
        let capType = client.capitalize(type);
        if (allStrenght[type] === 2)
          superEffective.push(
            `${typeData[capType] ? typeData[capType].emoji : ''} ${capType}`
          );
        if (allStrenght[type] > 2)
          ultraEffective.push(
            `${typeData[capType] ? typeData[capType].emoji : ''} ${capType}`
          );
      }

      for (let type in allWeakness) {
        let capType = client.capitalize(type);
        if (allWeakness[type] === 2)
          superWeakness.push(
            `${typeData[capType] ? typeData[capType].emoji : ''} ${capType}`
          );
        if (allWeakness[type] > 2)
          ultraWeakness.push(
            `${typeData[capType] ? typeData[capType].emoji : ''} ${capType}`
          );
      }

      let gifurl = '';
      try {
        gifurl = pokemonGif(Number(mon.id));
      } catch (e) {
        console.log(`pokeGif couldn't pull a gif for #${mon.id}: ${e.message}`);
      }

      let result = '';
      let low = 9999;
      let high = 0;
      if (cp) {
        for (let l = 40; l >= 1; l--) {
          low = 9999;
          high = 0;
          for (let a = 1; a <= 15; a++) {
            for (let d = 1; d <= 15; d++) {
              for (let s = 1; s <= 15; s++) {
                if (client.monsterUtils.calculateCp(mon, l, a, d, s) == cp) {
                  let percent = Math.round((100 * (a + d + s)) / 45);
                  if (percent < low) {
                    low = percent;
                  }
                  if (percent > high) {
                    high = percent;
                  }
                }
              }
            }
          }
          if (low < 9999 && high > 0) {
            result = result + 'Level **' + l + '**  CP: **' + cp + '**  IV: **';
            if (low == high) {
              result = result + low + '%';
            } else {
              result = result + low + '% - ' + high + '%';
            }
            result = result + '** \\n';
          }
        }
      } else if (iv == 100) {
        for (let l = 40; l >= 1; l--) {
          let cp = client.monsterUtils.calculateCp(mon, l, 15, 15, 15);
          result =
            result +
            'Level **' +
            l +
            '**  CP: **' +
            cp +
            '**  IV: **' +
            iv +
            '%** \\n';
        }
      } else {
        cp = client.monsterUtils.calculateCp(mon, level, atk, def, sta);
        result =
          'Level **' +
          level +
          '** (' +
          atk +
          '/' +
          def +
          '/' +
          sta +
          ') CP: **' +
          cp +
          '** \\n';
      }
      if (result.length == 0) {
        result = '*No matches found* \\n';
      }

      const lo15 = client.monsterUtils.calculateCp(mon, 15, 10, 10, 10);
      const hi15 = client.monsterUtils.calculateCp(mon, 15, 15, 15, 15);
      const lo20 = client.monsterUtils.calculateCp(mon, 20, 10, 10, 10);
      const hi20 = client.monsterUtils.calculateCp(mon, 20, 15, 15, 15);
      const lo25 = client.monsterUtils.calculateCp(mon, 25, 10, 10, 10);
      const hi25 = client.monsterUtils.calculateCp(mon, 25, 15, 15, 15);

      const view = {
        name: mon.name,
        imageurl: imgurlRes.status === 200 ? imgurl : art_url,
        id: mon.id,
        gifurl: gifurl,
        type: typeString.join(', '),
        color: mon.types[0].color,
        description,
        superWeak: superWeakness.join(', '),
        ultraWeak: ultraWeakness.join(', '),
        superStrong: superEffective.join(', '),
        ultraStrong: ultraEffective.join(', '),
        baseAtk: mon.stats.baseAttack,
        baseDef: mon.stats.baseDefense,
        baseSta: mon.stats.baseStamina,
        atk,
        def,
        sta,
        cp,
        level,
        result,
        lo15,
        hi15,
        lo20,
        hi20,
        lo25,
        hi25,
      };

      const template = JSON.stringify(client.dts.monster);
      const message = client.mustache.render(template, view);
      msg.reply(JSON.parse(message));
      console.log(`${msg.author.username} requested info on ${mon.name}`);
    });
  } catch (err) {
    console.error('Pokedex command unhappy:', err);
  }
};

exports.aliases = () => {
  return ['dex'];
};
