module.exports = (client, channel) => {
  if (typeof client.watching[channel.id] !== 'undefined') {
    console.log(`Channel deleted: ${channel.name}`);
    delete client.watching[channel.id];
  }
};
