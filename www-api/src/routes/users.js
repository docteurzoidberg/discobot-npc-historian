const _checkUserId = (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }
  //should be numeric
  if (isNaN(userId)) {
    throw new Error('userId must be numeric');
  }
};

const _checkSettings = (settings) => {
  if (!settings) {
    throw new Error('settings is required');
  }
  //should be an object
  if (typeof settings !== 'object') {
    throw new Error('settings must be an object');
  }
};

const getUsers = (req, res) => {
  const { logger } = req;
  logger.info('getUsers');
  res.json({ users: [] });
};

const getUserSettings = (req, res) => {
  const { logger } = req;
  const { userId } = req.params;
  logger.info('getUserSettings', { userId });
  res.json({ settings: {} });
};

const updateUserSettings = (req, res) => {
  const { logger } = req;
  const { userId } = req.params;
  const settings = req.body;
  logger.info('updateUserSettings', { userId, settings });
  res.json({ settings });
};

const router = require('express').Router();
router.get('/', getUsers);
router.get('/:userId/settings', getUserSettings);
router.put('/:userId/settings', updateUserSettings);
module.exports = router;
