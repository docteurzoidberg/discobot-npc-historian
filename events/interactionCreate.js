module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction)  {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		if (interaction.isCommand()) {
			console.log('command: ' + interaction.commandName);
			
			//await interaction.deferReply({ephemeral: false}).catch(()=>{});
			const command = client.commands.get(interaction.commandName);
			if(!command) return;
			if(!command.execute) return;
			try {
				await command.execute(client, interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		} else if(interaction.isAutocomplete()) {
			console.log('autocomplete: ' + interaction.commandName);
			const command = client.commands.get(interaction.commandName);
			if(!command) return;
			if(!command.autocomplete) return;
			try {
				await command.autocomplete(client, interaction);
			} catch (error) {
				console.error(error);
				//await interaction.reply({ content: 'There was an error while executing autocomplete for this command!', ephemeral: true });
			}
		}
		return;
	},
};
