const moment = require('moment');
const grok = require('../grok').loadDefaultSync();
const LOGLEVEL_PATTERN = grok.createPattern('^%{LOGLEVEL:level} %{GREEDYDATA:message}$');
const uuid = require('uuid');
/**
 *  @function grokParse
 *  Returns a promise for the parsed message based on a pattern
 *  @param {string} pattern The GROK pattern to use
 *  @param {string} message The message to parse
 *  @returns {object} A parsed message object
 */
const grokParse = (pattern, message) => {
  return new Promise((resolve, reject) => {
    pattern.parse(message, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

const messageParser = {
  /**
   *  @function parseMany
   *  Parse an array of incoming log requests into an array HALPAS JSON object
   *  @param {string} authorizedParty A string representing the authorized party
   *  @param {object[]} obj A JSON Array, pre-validated to contain expected fields
   *  @returns {object[]} Returns an array of JSON Object for HALPAS logstash
   */
  parseMany: async (authorizedParty, obj) => {
    const txid = uuid.v4();
    const ts = moment.utc().valueOf();
    obj.forEach((item, idx) => {
      item.transaction = {batch: {id: txid, size: obj.length, itemId: idx+1, timestamp: ts}};
    });
    return await Promise.all(obj.map(entry => messageParser.parse(authorizedParty, entry)));
  },

  /**
   *  @function parse
   *  Parse an incoming log request into HALPAS JSON object
   *  @param {string} authorizedParty A string representing the authorized party
   *  @param {object} obj A JSON Object, pre-validated to contain expected fields
   *  @returns {object} Returns a JSON Object for HALPAS logstash
   */
  parse: async (authorizedParty, obj) => {
    // default clogs object with metadata
    const clogs = {
      client: authorizedParty,
      level: (obj && obj.level) ? obj.level : 'info',
      retention: (obj && obj.retention) ? obj.retention : 'default',
      timestamp: moment.utc().valueOf(),
      env: (obj && obj.env) ? obj.env : 'dev'
    };

    if (obj && obj.transaction && obj.transaction === Object(obj.transaction)) {
      Object.assign(clogs, obj.transaction);
    } else {
      clogs.batch = {id: uuid.v4(), size: 1, itemId: 1, timestamp: clogs.timestamp};
    }

    if (obj && obj.metadata && obj.metadata === Object(obj.metadata)) {
      Object.assign(clogs, obj.metadata);
    }

    if (obj && obj.message) {
      // No supplied format/grok pattern...
      if (!obj.pattern) {
        // does it start with a log level?
        const pattern = grok.getPattern(LOGLEVEL_PATTERN.id);
        const o = await grokParse(pattern, obj.message);
        if (o) {
          // yes, so set the level and remove level from data message
          clogs.level = o.level;
          // set the data message
          clogs.data = { message: o.message };
        } else {
          // no log level, set the data message
          clogs.data = { message: obj.message };
        }
      } else {
        // pattern supplied, use it
        const pattern = grok.createPattern(obj.pattern);
        const o = await grokParse(pattern, obj.message);
        if (o) {
          clogs.level = o.level ? o.level : 'info';
          clogs.data = Object.assign({}, o);
        } else {
          // couldn't match up the expected pattern... return message and pattern
          clogs.data = { message: obj.message, pattern: obj.pattern };
        }
      }
    } else {
      // passed in JSON, let's touch it up and pass it along...
      if (obj && obj.data) {
        clogs.data = Object.assign({}, obj.data);
        if (clogs.data.level) {
          clogs.level = clogs.data.level;
        }
        if (clogs.data.env) {
          clogs.env = clogs.data.env;
        }
      }
    }
    return { clogs: clogs };
  }
};

module.exports = messageParser;
