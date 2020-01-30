const log = require('npmlog');
const loggingRouter = require('express').Router();

const logstashSvc = require('../../components/logstashSvc');
const messageParser = require('../../components/messageParser');
const { validateLogging } = require('../../middleware/validation');

loggingRouter.post('/', validateLogging, async (req, res, next) => {
  try {
    const clogsMessage = await messageParser.parse(req.authorizedParty, req.body);
    await logstashSvc.log(clogsMessage);
    res.send();
  } catch (error) {
    log.error(error);
    next(error);
  }
});

module.exports = loggingRouter;
