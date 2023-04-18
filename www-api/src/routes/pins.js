const api = require('../lib/historian');

async function getChannelPins(req, res) {
  const { logger } = req;
  const { channelId } = req.params;
  logger.info(`getChannelPins ${channelId}`);
  const pins = await api.getChannelPins(channelId);
  res.json(pins);
}

async function getChannelPinById(req, res) {
  const { logger } = req;
  const { channelId, pinId } = req.params;
  logger.info(`getChannelPinById ${channelId} ${pinId}`);
  const pin = await api.getChannelPinById(channelId, pinId);
  res.json(pin);
}

async function addChannelPin(req, res) {
  const { logger } = req;
  const { channelId } = req.params;
  const { pin } = req.body;
  logger.info(`addChannelPin ${channelId}`);
  const newPin = await api.addChannelPin(channelId, { pin: pin });
  res.json(newPin);
}

async function deleteChannelPin(req, res) {
  const { logger } = req;
  const { channelId, pinId } = req.params;
  logger.info(`deleteChannelPin ${channelId} ${pinId}`);
  await api.deleteChannelPin(channelId, pinId);
  res.json({ success: true });
}

async function getAllPins(req, res) {
  const { logger } = req;
  logger.info('getAllPins');
  const pins = await api.getAllPins();
  res.json(pins);
}

const router = require('express').Router();

router.get('/', getAllPins);
router.get('/:channelId/:pinId', getChannelPinById);
router.delete('/:channelId/:pinId', deleteChannelPin);
router.get('/:channelId', getChannelPins);
router.post('/:channelId', addChannelPin);

module.exports = router;
