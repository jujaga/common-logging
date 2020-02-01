const models = {
  loggingEntry: {
    /** @function data is not required and must be an object */
    data: value => {
      return !value || (value && value !== null && value.constructor.name === 'Object');
    },
    /** @function level is not required, must be a string */
    level: value => {
      return !value || (value && validatorUtils.isString(value));
    },
    /** @function message is not required, must be a string */
    message: value => {
      return !value || (value && validatorUtils.isString(value));
    },
    /** @function pattern is not required, must be a string */
    pattern: value => {
      return !value || (value && validatorUtils.isString(value));
    },
    /** @function retention is not required, must be a string */
    retention: value => {
      return !value || (value && validatorUtils.isString(value));
    },
  }
};

const customValidators = {
  logging: obj => {
    // validate the logging endpoint
    // completely valid object will return an empty array of errors.
    // an invalid object will return a populated array of errors.
    const errors = [];

    if (!Array.isArray(obj)) {
      errors.push({ value: obj, message: 'Invalid value `logging`. Expect an array of logging entries.' });
    } else {
      obj.forEach(o => {
        let count = 0;
        if (!models.loggingEntry.data(o.data)) {
          errors.push({ value: o.data, message: 'Invalid value `data`.' });
          count++;
        }
        if (!models.loggingEntry.level(o.level)) {
          errors.push({ value: o.level, message: 'Invalid value `level`.' });
        }
        if (!models.loggingEntry.message(o.message)) {
          errors.push({ value: o.message, message: 'Invalid value `message`.' });
          count++;
        }
        if (!models.loggingEntry.pattern(o.pattern)) {
          errors.push({ value: o.pattern, message: 'Invalid value `pattern`.' });
        }
        if (!models.loggingEntry.retention(o.retention)) {
          errors.push({ value: o.retention, message: 'Invalid value `retention`.' });
        }

        // need a valid message or valid data object to log
        if (count === 2 || !(o['data'] || o['message'])) {
          errors.push({ message: '`message` or `data` is required.' });
        }
      });
    }

    return errors;
  }
};

const validatorUtils = {
  /** @function isString */
  isString: x => {
    return Object.prototype.toString.call(x) === '[object String]';
  }
};

module.exports = { models, customValidators, validatorUtils };
