const axios = require('axios');
const config = require('config');
const log = require('npmlog');
const Problem = require('api-problem');

const utils = require('./utils');

const logstashSvc = {
  /**
   *  @function logMany
   *  Sends an array of CLOGS log entries to a logstash endpoint
   *  @param {object[]} msg An array of CLOGS JSON objects
   */
  logMany: async msgArr => {
    await Promise.all(
      msgArr.map(msg => logstashSvc.log(msg))
    );
  },

  /**
   *  @function log
   *  Sends a CLOGS log entry to a logstash endpoint
   *  @param {object} msg A CLOGS JSON object
   *  @throws if something unexpected occurs
   */
  log: async msg => {
    try {
      const response = await axios.post(
        config.get('elkStack.logstashUrl'),
        msg,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );
      if (response.status !== 200) throw new Error('HTTP response not 200');
    } catch (e) {
      if (e.response) {
        log.error('logstashSvc.log', `Error from LOGSTASH: status = ${e.response.status}, data : ${utils.prettyStringify(e.response.data)}`);
        throw new Problem(e.response.status, { detail: e.response.data.detail });
      } else {
        log.error('logstashSvc.log', `Unknown error calling LOGSTASH: ${e.message}`);
        throw new Problem(500, 'Unknown LOGSTASH Error', { detail: e.message });
      }
    }
  }
};

module.exports = logstashSvc;
