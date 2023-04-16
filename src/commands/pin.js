require("dotenv").config();
const wait = require("node:timers/promises").setTimeout;

// eslint-disable-next-line import/no-extraneous-dependencies
const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { ApplicationCommandType } = require("discord-api-types/v9");

const api = require("../lib/api");

const commands = new ContextMenuCommandBuilder()
  .setName("📌 le message")
  .setType(ApplicationCommandType.Message);

/* COMMANDS */

async function commandTranslate(client, interaction) {
  const targetMessage = interaction.targetMessage;
  //ignore bot messages
  if (targetMessage.author.bot) return;
  if (targetMessage.partial) {
    await targetMessage.fetch();
  }

  interaction.deferReply({ content: "J'enregistre...", ephemeral: true });

  try {
    const messageAuthor = targetMessage.author.username;
    const messageContent = targetMessage.content;
    client.logger.debug("message", messageContent);

    //todo: call api

    const responseMessage = `Le message de **${messageAuthor}** a été enregistré !`;

    interaction.targetMessage.reply(responseMessage);

    const loggerMsg = `Enregistrement du message ${targetMessage.id} demandé par ${interaction.user.username}`;
    client.logger.info(loggerMsg);
    interaction.editReply({
      content: "Message sauvegardé !",
      ephemeral: true,
    });
    wait(5000);
    interaction.deleteReply();
  } catch (error) {
    client.logger.error(error);
  }
}

module.exports = {
  data: commands,
  async execute(client, interaction) {
    await commandTranslate(client, interaction);
  },
};
