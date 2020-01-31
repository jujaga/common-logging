const models = {
  loggingEntry: {
    /** @function data is not required and must be an object */
    data: value => {
      const o = value['data'];
      return !o || (o && o != null && o.constructor.name === 'Object');
    },
    /** @function level is not required, must be a string */
    level: value => {
      const o = value['level'];
      return !o || (o && validatorUtils.isString(o));
    },
    /** @function message is not required, must be a string */
    message: value => {
      const o = value['message'];
      return !o || (o && validatorUtils.isString(o));
    },
    /** @function pattern is not required, must be a string */
    pattern: value => {
      const o = value['pattern'];
      return !o || (o && validatorUtils.isString(o));
    },
    /** @function retention is not required, must be a string */
    retention: value => {
      const o = value['retention'];
      return !o || (o && validatorUtils.isString(o));
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
      obj.forEach(obj => {
        let count = 0;
        if (!models.loggingEntry.data(obj)) {
          errors.push({ value: obj['data'], message: 'Invalid value `data`.' });
          count++;
        }
        if (!models.loggingEntry.level(obj)) {
          errors.push({ value: obj['level'], message: 'Invalid value `level`.' });
        }
        if (!models.loggingEntry.message(obj)) {
          errors.push({ value: obj['message'], message: 'Invalid value `message`.' });
          count++;
        }
        if (!models.loggingEntry.pattern(obj)) {
          errors.push({ value: obj['pattern'], message: 'Invalid value `pattern`.' });
        }
        if (!models.loggingEntry.retention(obj)) {
          errors.push({ value: obj['retention'], message: 'Invalid value `retention`.' });
        }

        // need a valid message or valid data object to log
        if (count === 2 || !(obj['data'] || obj['message'])) {
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
