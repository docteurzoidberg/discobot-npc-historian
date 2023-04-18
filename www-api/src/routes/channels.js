

const getChannels = (req, res) => {
  const { logger } = req;
  logger.info('getChannels');
  res.json({ channels: [] });
};


const router = require('express').Router();
router.get('/', getChannels);
module.exports = router;