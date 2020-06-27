const cp_multipliers = require('./cp-multipliers');

const calculateCp = function (monster, level, ivAttack, ivDefense, ivStamina) {
  const cp_multi = cp_multipliers[level];
  const atk = monster.stats.baseAttack;
  const def = monster.stats.baseDefense;
  const sta = monster.stats.baseStamina;

  return Math.max(
    10,
    Math.floor(
      ((atk + ivAttack) *
        (def + ivDefense) ** 0.5 *
        (sta + ivStamina) ** 0.5 *
        cp_multi ** 2) /
        10
    )
  );
};

const getMonById = function (client, id) {
  let pokemon = Object.values(client.monsters).filter((mon) => {
    return mon.form.id == 0 && mon.id == id;
  });

  if (pokemon.length > 0) {
    return pokemon[0];
  }

  return null;
};

const getIdFromMon = function (client, pokemon, form = 0) {
  let monsters = Object.values(client.monsters).filter((mon) => {
    if (
      mon.form.id == form &&
      pokemon.length > 3 &&
      mon.name.toLowerCase().indexOf(pokemon) == 0
    ) {
      return true;
    }

    return false;
  });

  if (monsters.length > 0) {
    return monsters[0].id;
  }

  return 0;
};

module.exports = {
  calculateCp,
  getMonById,
  getIdFromMon,
};
