const getSetting = async (client, key, ret = null) => {
  const result = await client.pool.query(
    "SELECT value FROM dex_settings WHERE `key` = '" + key + "'"
  );
  if (result.length == 1) {
    return result[0].value;
  }

  return ret;
};

const setSetting = async (client, key, value) => {
  return client.pool.query(
    "INSERT INTO dex_settings VALUES ('" +
      key +
      "', '" +
      value +
      "') ON DUPLICATE KEY UPDATE `key`='" +
      key +
      "', `value`='" +
      value +
      "'"
  );
};

module.exports = {
  getSetting,
  setSetting,
};
