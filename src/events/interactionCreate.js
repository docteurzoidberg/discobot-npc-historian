//this module handles all the interactions
module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    //command
    if (interaction.isMessageContextMenuCommand() || interaction.isCommand()) {
      client.logger.info(
        `<${
          interaction.user.tag
        }> used command ${interaction.commandName.toUpperCase()} in #${interaction.channel.name.toUpperCase()}`
      );

      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      if (!command.execute) return;
      try {
        await command.execute(client, interaction);
      } catch (error) {
        client.logger.error(error);
        await interaction.reply({
          content:
            "Erreur lors de l'execution de la commande. (Dire a l'admin de look les logs) !",
          ephemeral: true,
        });
      }
    }
    //unhandled interaction
    else {
      client.logger.warn(
        `<${
          interaction.user.tag
        }> in #${interaction.channel.name.toUpperCase()} triggered an unhandled interaction`
      );
    }
    return;
  },
};
