const axios = require('axios');
const config = require('config');
const log = require('npmlog');

const utils = require('./utils');

const healthSvc = {
  /**
   *  @function check
   *  Call the health checks.
   *  1. Call logstash node stats events API to see if we can connect to logstash
   *  Return health check object array
   */
  check: async () => {
    const logstash = {
      name: 'logstash',
      healthy: false,
      info: ''
    };
    try {
      const response = await axios.get(config.get('elkStack.logstashUrl'));
      logstash.healthy = (response.status === 200);
      logstash.info = response.data;
    } catch (e) {
      if (e.response) {
        log.error('healthSvc.health', `Error from LOGSTASH: status = ${e.response.status}, data : ${utils.prettyStringify(e.response.data)}`);
        logstash.info = `Logstash could not be reached, status is ${e.response.status}.`;
      } else {
        log.error('healthSvc.logstashEventsStats', `Unknown error calling LOGSTASH: ${e.message}`);
        logstash.info = `Logstash could not be reached, unknown error: ${e.message}.`;
      }
    }
    return [logstash];
  }
};

module.exports = healthSvc;
