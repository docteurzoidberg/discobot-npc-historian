require('dotenv').config();

const fs = require('fs');

const databasePath = process.env.DATABASE_PATH || './data';

async function loadChannelDatabase(channelId) {

    const databaseFile = `${databasePath}/${channelId}.json`;
    if (!fs.existsSync(databaseFile)) {
        await saveChannelDatabase(channelId, {});
    }

    const json = await fs.promises.readFile(databaseFile, 'utf8');
    let db = {};
    try {
        db = JSON.parse(json);
    } catch (error) {
        throw new Error(`Error parsing database file: ${error}`);
    }
    return db;
}

async function saveChannelDatabase(channelId, db) {
    const databaseFile = `${databasePath}/${channelId}.json`;
   
    //merge new object with db one
    const newdb = {
        version: 1,
        dateUpdated: new Date(),
        ...db
    };

    try {
        return await fs.promises.writeFile(databaseFile, JSON.stringify(newdb, null, 2));
    } catch (error) {
        throw new Error(`Error writing database file: ${error}`);
    }
}

module.exports = {
    loadChannelDatabase
};