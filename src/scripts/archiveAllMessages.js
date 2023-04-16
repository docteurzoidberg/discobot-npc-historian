require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const BOT_INVISIBLE = process.env.BOT_INVISIBLE === 'true';
const BOT_TOKEN = process.env.BOT_TOKEN || false;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || false;

const DATA_PATH = process.env.DATA_PATH || './data';

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN environment variable not set');
  process.exit(1);
}

if(!DISCORD_GUILD_ID) {
  console.error('DISCORD_GUILD_ID environment variable not set');
  process.exit(1);
}

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

async function fetchAllMessages(channelId) {

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error(`Channel ${channelId} not found`);
    return;
  }

  const messageFile = DATA_PATH + '/' + channelId + '.txt';

  //test if file exists
  if (fs.existsSync(messageFile)) {
    console.log(`File ${messageFile} already exists`);
    return;
  }

  // Create message pointer
  let message = await channel.messages
    .fetch({ limit: 1 });

  message = message.size === 1 ? message.first() : null;

  while (message) {
   
    try {
      const messagePage = await channel.messages
      .fetch({ limit: 100, before: message.id });

      const messages = [];
      messagePage.forEach(msg => messages.push(msg));

      // Update our message pointer to be last message in page of messages
      message = messagePage.size > 0 ? messagePage.last() : null;

      const messagesText = messages.map(msg => {
        const formattedDate = msg.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        return `${formattedDate} > ${msg.author.username}: ${msg.content}`;
      }).join('\n');
      
      console.log(messagesText);

      // dump message to disk
      try {
        fs.appendFileSync(messageFile, messagesText + '\n');
      }
      catch (err) {
        console.error(err);
      }
    }
    catch (err) {
      console.error(err);
      return;
    }
  }
  console.log(`Finished fetching messages for channel ${channelId}`);
}

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	presence: {
		status: BOT_INVISIBLE ? 'invisible' : 'online',
	}
});

// handle process signals
async function closeGracefully(signal) {
  console.log(`Received signal to terminate: ${signal}, closing`);
  await client.destroy();
  process.exit();
}

process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)


async function getChannels() 
{
  const discordServer = client.guilds.cache.get(DISCORD_GUILD_ID.toString());
  if(!discordServer) {
    console.error(`Guild ${DISCORD_GUILD_ID} not found`);
    return;
  }
  // no cache
  let channels = await discordServer.channels.fetch();
  if(!channels) {
    console.error(`No channels found for guild ${DISCORD_GUILD_ID}`);
    return;
  }
  //ensure we only have text channels
  return channels.map(channel => channel.id);
}


async function main() {

  await client.login(BOT_TOKEN);
  console.log('Logged in');
  
  //get all channels
  let channels = await getChannels();
  
  console.log(`Found ${channels.length} channels`);
  for(const channelCache of channels)
  {
    const channel = await client.channels.fetch(channelCache);

    if(channel.type !== ChannelType.GuildText)  {
      console.log(`Channel ${channel.name} (${channel.id}) is not a text channel, skipping`);
      continue;
    }

    try {
       await fetchAllMessages(channel.id);
    }
    catch(err) {
      console.error(`Error fetching messages for channel ${channel.name} (${channel.id}): ${err}`);
    }
   
    console.log(`Done with channel ${channel.name} (${channel.id}) !`);

    //save channel info to json
    const channelInfo = {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      topic: channel.topic,
      nsfw: channel.nsfw,
      createdAt: channel.createdAt,
      lastMessageId: channel.lastMessageId
    };
    const channelInfoFile = DATA_PATH + '/' + channel.id + '.json';
    try {
      fs.writeFileSync(channelInfoFile, JSON.stringify(channelInfo, null, 2));
    }
    catch(err) {
      console.error(`Error writing channel info file ${channelInfoFile}: ${err}`);
    }
  }

  console.log('Done all channels');
  await client.destroy();
}

main();
