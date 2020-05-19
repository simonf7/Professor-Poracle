module.exports = (client, channel) => {
  console.log(`channelDelete: ${channel}`);
  if (typeof client.watching[channel.id] !== 'undefined') {
    delete client.watching[channel.id];
  }
};
