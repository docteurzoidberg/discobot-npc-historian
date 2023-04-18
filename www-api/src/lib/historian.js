require('dotenv').config();

const fs = require('fs');

const databasePath = process.env.DATABASE_PATH || './data';

const _checkPin = (pin) => {
  //pin message
  if (!pin.message) throw new Error('No pin.message provided');
  //pin author
  //pin reason should be a valid string
  if (pin.reason && typeof pin.reason !== 'string') {
    throw new Error(`pin.reason is not a string: ${pin.reason}`);
  }
  //pin tags if provided should be an array of strings
  if (pin.tags) {
    if (!Array.isArray(pin.tags)) {
      throw new Error(`pin.tags is not an array: ${pin.tags}`);
    }
    pin.tags.forEach((tag) => {
      _checkTag(tag);
    });
  }
};

const _checkTag = (tag) => {
  //tag should be a string
  if (typeof tag !== 'string') {
    throw new Error(`tag is not a string: ${tag}`);
  }

  //tag length should be between 1 and 20 chars
  if (tag.length > 20) {
    throw new Error(`tag too long: ${tag}`);
  }
  if (tag.length < 1) {
    throw new Error(`tag too short: ${tag}`);
  }

  //check for invalid characters
  if (!tag.match(/^[a-zA-Z0-9]+$/)) {
    throw new Error(`tag contains invalid characters: ${tag}`);
  }
};

const _checkChannelDatabase = (db) => {
  if (!db) throw new Error('No database found');
  if (!db.pins) throw new Error('No database.pins found');
};

const _checkPinId = (pinId) => {
  if (!pinId) throw new Error('No pinId provided');
  if (!pinId.match(/^[0-9]+$/)) throw new Error('Invalid pinId provided');
};

const _checkChannelId = (channelId) => {
  if (!channelId) throw new Error('No channelId provided');
  if (!channelId.match(/^[0-9]+$/))
    throw new Error('Invalid channelId provided');
};

const _checkPinObject = (pinObject) => {
  if (!pinObject) throw new Error('No pinObject provided');
  if (!pinObject.pin) throw new Error('No pinObject.pin provided');
  _checkPin(pinObject.pin);
};

const _checkTagObject = (tagObject) => {
  if (!tagObject) throw new Error('No tagObject provided');
  if (!tagObject.tag) throw new Error('No tagObject.tag provided');
  _checkTag(tagObject.tag);
};

async function _getChannelsIds() {
  const channelFiles = fs.readdirSync(`${databasePath}/pins`);
  const channelIds = channelFiles.map((file) => file.replace('.json', ''));
  //filter valid channel ids
  return channelIds.filter((channelId) => channelId.match(/^[0-9]+$/));
}

async function _loadChannelDatabase(channelId) {
  _checkChannelId(channelId);
  const databaseFile = `${databasePath}/pins/${channelId}.json`;
  if (!fs.existsSync(databaseFile)) {
    await _saveChannelDatabase(channelId, { pins: [] });
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

async function _saveChannelDatabase(channelId, db) {
  const databaseFile = `${databasePath}/pins/${channelId}.json`;
  const newdb = {
    version: 1,
    lastUpdated: new Date(),
    pins: [...db.pins],
  };
  try {
    return await fs.promises.writeFile(
      databaseFile,
      JSON.stringify(newdb, null, 2)
    );
  } catch (error) {
    throw new Error(`Error writing database file: ${error}`);
  }
}

async function getChannelPinById(channelId, pinId) {
  _checkChannelId(channelId);
  _checkPinId(pinId);
  const db = await _loadChannelDatabase(channelId);
  _checkChannelDatabase(db);
  return db.pins.find((a) => a.id.toLowerCase() === pinId.toLowerCase());
}

async function getChannelPins(channelId) {
  _checkChannelId(channelId);
  const db = await _loadChannelDatabase(channelId);
  _checkChannelDatabase(db);
  return db.pins;
}

async function addChannelPin(channelId, pinObject) {
  _checkChannelId(channelId);
  _checkPinObject(pinObject);

  //uuid
  const newId = pinObject.pin.message.id;
  const newPin = { ...pinObject.pin, id: newId, dateCreated: new Date() };
  _checkPin(newPin);

  //TODO: check against all channels. not only this one
  const db = await _loadChannelDatabase(channelId);
  _checkChannelDatabase(db);
  db.pins.forEach((element) => {
    if (element.id.toLowerCase() === newId.toLowerCase()) {
      throw new Error(`Error adding pin: ${newId} already exists`);
    }
  });

  db.pins.push(newPin);
  await _saveChannelDatabase(channelId, db);
  return newPin;
}

async function deleteChannelPin(channelId, pinId) {
  _checkChannelId(channelId);
  _checkPinId(pinId);
  const db = await _loadChannelDatabase(channelId);
  _checkChannelDatabase(db);
  let found = -1;
  db.pin.forEach((element, index) => {
    if (element.id.toLowerCase() === pinId.toLowerCase()) {
      found = index;
    }
  });
  if (found === -1) {
    throw new Error(`Error deleting pin: ${pinId} not found`);
  }

  let pin = db.pins[found];
  pin.dateDeleted = new Date();

  //update database
  db.pins[found] = pin;
  await _saveChannelDatabase(channelId, db);
  return pin;
}

module.exports = {
  getChannelPinById,
  getChannelPins,
  addChannelPin,
  deleteChannelPin,
};
