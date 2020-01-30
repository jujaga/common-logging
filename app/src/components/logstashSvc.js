const axios = require('axios');
const config = require('config');
const log = require('npmlog');
const Problem = require('api-problem');

const logstashSvc = {
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
        log.error(`Error from LOGSTASH: status = ${e.response.status}, data : ${JSON.stringify(e.response.data, null, 2)}`);
        throw new Problem(e.response.status, { detail: e.response.data.detail });
      } else {
        log.error(`Unknown error calling LOGSTASH: ${e.message}`);
        throw new Problem(500, 'Unknown LOGSTASH Error', { detail: e.message });
      }
    }
  }
};

module.exports = logstashSvc;
