module.exports = (client, channel) => {
  console.log(`Channel deleted: ${channel.name}`);
  if (typeof client.watching[channel.id] !== 'undefined') {
    delete client.watching[channel.id];
  }
};
