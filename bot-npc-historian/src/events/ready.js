module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const guilds = client.guilds.cache;
    const serverArray = [];

    //populate server names and guild ids
    guilds.forEach(async (guild) => {
      //in cache ?
      if (!guild.available) {
        //fetch
        await guild.fetch();
      }
      serverArray.push({
        name: guild.name,
        id: guild.id,
      });
    });

    const serverList = serverArray.map((server) => {
      return `${server.name} (${server.id})`;
    });

    client.logger.info(`NPC-Historian v${client.version} ready !`);
    client.logger.info(
      `Logged in as ${client.user.tag} on ${
        guilds.size
      } servers: ${serverList.join(", ")}`
    );
    if (client.invisible) {
      client.logger.warn("Bot status set to invisible !");
      client.user.setStatus("invisible");
    }
  },
};
