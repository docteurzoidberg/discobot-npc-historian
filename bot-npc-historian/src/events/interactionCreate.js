//this module handles all the interactions
module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    //command
    if (interaction.isCommand()) {
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
    //modal
    else if (interaction.isModalSubmit()) {
      client.logger.info(
        `<${
          interaction.user.tag
        }> submitted modal ${interaction.customId.toUpperCase()} in #${interaction.channel.name.toUpperCase()}`
      );

      const modalId = interaction.customId.toLowerCase();
      let modalName = modalId;

      //check if modal customId is splittable
      if (modalId.includes("-")) {
        //get the first part of the customId
        modalName = modalId.split("-")[0];
      }

      if (!modalName) return;
      const modal = client.modals.get(modalName);
      if (!modal) {
        client.logger.warn(`Modal ${modalName} not found!`);
        return;
      }
      if (!modal.execute) {
        client.logger.warn(`Modal ${modalName} has no execute function!`);
        return;
      }
      try {
        await modal.execute(client, interaction);
      } catch (error) {
        client.logger.error(error);
        await interaction.reply({
          content:
            "Erreur lors de l'execution de la modale. (Dire a l'admin de look les logs) !",
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
