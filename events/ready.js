require('dotenv').config();
const BOT_INVISIBLE = process.env.BOT_INVISIBLE === 'true';
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		if(BOT_INVISIBLE) {
			client.user.setStatus('invisible');
		}
	},
};