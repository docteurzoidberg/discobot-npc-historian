require("dotenv").config();
const wait = require("node:timers/promises").setTimeout;
const api = require("../lib/api");

// eslint-disable-next-line import/no-extraneous-dependencies
const {
  ContextMenuCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
const {
  APIApplicationCommandPermissionsConstant,
} = require("discord-api-types/v10");

const {
  ApplicationCommandType,
  TextInputStyle,
} = require("discord-api-types/v9");

const commands = new ContextMenuCommandBuilder()
  .setName("Pin le message")
  .setType(ApplicationCommandType.Message);

/* COMMANDS */

async function commandPin(client, interaction) {
  const targetMessage = interaction.targetMessage;

  //fetch message if not cached
  if (targetMessage.partial) {
    await targetMessage.fetch();
  }

  //ignore bot messages
  if (targetMessage.author.bot) return;

  //interaction.deferReply({ content: "J'enregistre...", ephemeral: true });

  try {
    //check if message is already pinned
    const messagepin = await api.getChannelPinById(
      interaction.channelId,
      targetMessage.id
    );
    if (messagepin) {
      interaction.reply({
        content: "Ce message est déjà enregistré !",
        ephemeral: true,
      });
      return;
    }
  } catch (error) {}

  try {
    const messageAuthor = targetMessage.author.username;
    const messageContent = targetMessage.content;
    client.logger.debug("message", messageContent);

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId("myPinModal-" + targetMessage.id)
      .setTitle("📌 Enregistrer un message");

    // Add components to modal

    // Create the text input components
    const reasonInput = new TextInputBuilder()
      .setCustomId("reasonInput")
      .setLabel("Quel est le motif pour ce pin ?")
      .setStyle(TextInputStyle.Short);

    const tagsInput = new TextInputBuilder()
      .setCustomId("tagsInput")
      .setLabel("Mettre des tags ? (séparés par des virgules)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
    const secondActionRow = new ActionRowBuilder().addComponents(tagsInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
    const loggerMsg = `Enregistrement du message ${targetMessage.id} demandé par ${interaction.user.username}`;
    client.logger.info(loggerMsg);
  } catch (error) {
    client.logger.error(error);
  }
}

module.exports = {
  data: commands,
  async execute(client, interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;
    await commandPin(client, interaction);
  },
};
