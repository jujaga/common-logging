const log = require('npmlog');
const healthRouter = require('express').Router();

const healthSvc = require('../../components/healthSvc');

healthRouter.get('/', async (req, res, next) => {
  try {
    const checks = await healthSvc.check();
    res.status(200).json({ dependencies: checks });
  } catch (error) {
    log.error(error);
    next(error);
  }
});

module.exports = healthRouter;
