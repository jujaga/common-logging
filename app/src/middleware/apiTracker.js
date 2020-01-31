/**
 * @module ApiTracker
 *
 * Log statistics for CDOGS Requests.
 *
 * @see morgan
 *
 * @exports initializeApiTracker
 */
const config = require('config');
const moment = require('moment');
const morgan = require('morgan');

const logstashSvc = require('../components/logstashSvc');
const messageParser = require('../components/messageParser');

// this will suppress a console warning about moment deprecating a default fallback on non ISO/RFC2822 date formats
// we will just force it to use the new Date constructor.
moment.createFromInputFallback = function (config) {
  config._d = new Date(config._i);
};

const logUrl = '/api/v1/log';
const trackerUrls = [logUrl];

// add in any token (custom or morgan built-in) we want to the format, then morgan can parse out later
// status and response-time is a built-in morgan token
const apiTrackerFormat = ':op :azp :ts :message :data :pattern :level :status :response-time';

const apiTrackerPattern = '%{DATA:op} %{DATA:azp} %{NUMBER:ts} %{DATA:hasMessage} %{DATA:hasData} %{DATA:hasPattern} %{DATA:hasLevel} %{NUMBER:httpStatus} %{NUMBER:responseTime}';

const stashMessage = async msg => {
  const body = { message: msg.trim(), pattern: apiTrackerPattern };
  const clogsMessage = await messageParser.parseEntry(config.get('keycloak.clientId'), body);
  const success = await logstashSvc.log(clogsMessage);
  return success;
};

const apiTracker = async (req, res, next) => {

  if (trackerUrls.includes(req.url)) {
    req._ts = moment.utc().valueOf();
    req._op = req.url === logUrl ? 'LOG' : 'Unknown';

    /*
    // When/If we need to parse data out of the response, we would do it here...
    const defaultEnd = res.end;
    const chunks = [];
    res.end = (...restArgs) => {
      try {
        if (restArgs[0]) {
          chunks.push(Buffer.from(restArgs[0]));
        }
        const body = Buffer.concat(chunks).toString('utf8');
        const obj = JSON.parse(body);

      } catch (err) {
        log.error('mailApiTracker', err);
      }
      defaultEnd.apply(res, restArgs);
    };
    */
  }
  next();
};

const initializeApiTracker = app => {

  const tf = (token, req) => {
    try {
      return req.body[token] ? 'true' : 'false';
    } catch (e) {
      return 'false';
    }
  };

  // register token parser functions.
  // this one would depend on authorizedParty middleware being loaded
  morgan.token('azp', req => {
    return req.authorizedParty ? req.authorizedParty : '-';
  });

  morgan.token('op', req => {
    return req._op ? req._op : '-';
  });

  morgan.token('ts', req => {
    return req._ts ? req._ts : '0';
  });

  morgan.token('message', req => {
    return tf('message', req);
  });

  morgan.token('data', req => {
    return tf('data', req);
  });

  morgan.token('pattern', req => {
    return tf('pattern', req);
  });

  morgan.token('level', req => {
    return tf('level', req);
  });

  app.use(morgan(apiTrackerFormat, {
    // eslint-disable-next-line no-unused-vars
    skip: (req, _res) => {
      return !trackerUrls.includes(req.baseUrl);
    },
    stream: {
      write: s => {
        if (s && s.trim().length) {
          process.stdout.write(s);
          stashMessage(s);
        }
      }
    }
  }));

  app.use(apiTracker);

};

module.exports = initializeApiTracker;
