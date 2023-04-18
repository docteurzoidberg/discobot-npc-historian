require("dotenv").config({ path: __dirname + "/../../.env" });

const API_URL = process.env.API_URL || false;

const fetch = require("node-fetch");

async function getChannelPinById(channelId, pinId) {
  const response = await fetch(`${API_URL}/pins/${channelId}/${pinId}`);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
}

async function getChannelPins(channelId) {
  const response = await fetch(`${API_URL}/pins/${channelId}`);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
}

async function getAllPins() {
  const response = await fetch(`${API_URL}/pins`);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
}

async function pinMessage(channelId, pinObject) {
  const response = await fetch(`${API_URL}/pins/${channelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin: pinObject }),
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
}

module.exports = {
  getChannelPins,
  getChannelPinById,
  getAllPins,
  pinMessage,
};
