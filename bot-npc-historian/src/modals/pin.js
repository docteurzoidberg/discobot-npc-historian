require("dotenv").config();

const api = require("../lib/api");
const wait = require("node:timers/promises").setTimeout;

const pinEmoji = "📌";

async function modalPinSubmit(client, interaction) {
  const modalId = interaction.customId;
  const modalName = modalId.split("-")[0];
  const messageId = modalId.split("-")[1];

  //check modal name
  if (modalName.toLowerCase() !== "mypinmodal") return;

  //message id is in the modal id
  if (!messageId) return;

  //fetch message
  const message = await interaction.channel.messages.fetch(messageId);
  if (!message) {
    interaction.reply({
      content: "Le message n'a pas été trouvé !",
      ephemeral: true,
    });
    return;
  }

  console.log({ message });

  // Get the data entered by the user
  const reason = interaction.fields.getTextInputValue("reasonInput");
  const tags = interaction.fields.getTextInputValue("tagsInput");

  //check reason
  if (!reason) {
    interaction.reply({
      content: "Il faut un motif pour enregistrer un message !",
      ephemeral: true,
    });
    return;
  }

  //check reason length
  if (reason.length > 100) {
    interaction.reply({
      content: "Le motif doit faire moins de 100 caractères !",
      ephemeral: true,
    });
    return;
  }

  //split tags  by comma
  const tagsArray = tags.split(",");
  //remove empty tags
  const tagsArrayFiltered = tagsArray.filter((tag) => tag.trim() !== "");
  console.log({ reason, tagsArrayFiltered });

  //get channel id
  const channelId = interaction.channelId;
  const pinned = await api.pinMessage(channelId, {
    message: message,
    author: interaction.user,
    reason: reason,
    tags: tagsArrayFiltered,
  });
  console.log({ pinned });

  await interaction.reply({
    content: `${pinEmoji} message sauvegardé !`,
  });

  //reply to original message
  const messageToChannel = `${pinEmoji} ${interaction.user.username} a sauvegardé ce message pour la posterité ! Raison : ${reason}`;

  await message.reply({ content: messageToChannel });

  //delete modal
  await wait(5000);
  interaction.deleteReply();
}

module.exports = {
  customId: "mypinmodal",
  async execute(client, interaction) {
    //check command name?
    if (!interaction.isModalSubmit()) return;
    await modalPinSubmit(client, interaction);
  },
};
