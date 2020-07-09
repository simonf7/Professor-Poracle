exports.run = async (client, msg, args) => {
  args.forEach((a) => {
    const user = client.discordUtils.findUser(client, a);

    if (user) {
      user.send(
        'Hey ' +
          user.username +
          '\n\n' +
          "To watch a gym you need to use the command `!watch gymname` - you don't have to get the name completely right, just try a few words and I'll list the matching gyms for you to choose from." +
          '\n\n' +
          'To unwatch a gym just use the same command again.' +
          '\n\n' +
          "To see the gyms you're currently watching use the command `!watching`."
      );
    }
  });
};
