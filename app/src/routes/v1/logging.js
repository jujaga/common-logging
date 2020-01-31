const log = require('npmlog');
const loggingRouter = require('express').Router();

const logstashSvc = require('../../components/logstashSvc');
const messageParser = require('../../components/messageParser');
const { validateLogging } = require('../../middleware/validation');

loggingRouter.post('/', validateLogging, async (req, res, next) => {
  try {
    const clogsMessages = await messageParser.parse(req.authorizedParty, req.body);
    await Promise.all(clogsMessages.map(msg => logstashSvc.log(msg)));
    res.status(201).end();
  } catch (error) {
    log.error(error);
    next(error);
  }
});

module.exports = loggingRouter;
