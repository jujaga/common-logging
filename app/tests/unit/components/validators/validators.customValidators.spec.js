const helper = require('../../../common/helper');

const { customValidators } = require('../../../../src/components/validators');

helper.logHelper();

describe('customValidators.logging', () => {
  const loggingEntryBase = {
    level: 'info',
    pattern: '%{GREEDYDATA:data}',
    retention: 'default'
  };

  it('should return an error when input is undefined', () => {
    const body = undefined;
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(body);
    expect(result[0].message).toMatch('Invalid value `logging`. Expect an array of logging entries.');
  });

  it('should return an error when input is not array', () => {
    const body = {};
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(body);
    expect(result[0].message).toMatch('Invalid value `logging`. Expect an array of logging entries.');
  });

  it('should return an error when input is empty array', () => {
    const body = [];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(body);
    expect(result[0].message).toMatch('Invalid value `logging`. Array must not be empty.');
  });

  it('should return an error when data is invalid', () => {
    const data = 4;
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: data
      })
    ];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(data);
    expect(result[0].message).toMatch('Invalid value `data`.');
  });

  it('should return an error when level is invalid', () => {
    const level = 4;
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: {},
        level: level
      })
    ];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(level);
    expect(result[0].message).toMatch('Invalid value `level`.');
  });

  it('should return an error when message is invalid', () => {
    const message = 4;
    const body = [
      Object.assign({}, loggingEntryBase, {
        message: message
      })
    ];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(message);
    expect(result[0].message).toMatch('Invalid value `message`.');
  });

  it('should return an error when pattern is invalid', () => {
    const pattern = 4;
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: {},
        pattern: pattern
      })
    ];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(pattern);
    expect(result[0].message).toMatch('Invalid value `pattern`.');
  });

  it('should return an error when retention is invalid', () => {
    const retention = 4;
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: {},
        retention: retention
      })
    ];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual(retention);
    expect(result[0].message).toMatch('Invalid value `retention`.');
  });

  it('should return an error when data and message is missing', () => {
    const body = [loggingEntryBase];
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toBeUndefined();
    expect(result[0].message).toMatch('`message` or `data` is required.');
  });

  it('should return an error when data and message are both invalid', () => {
    const data = 4;
    const message = 5;
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: data,
        message: message
      })
    ];

    const result = customValidators.logging(body);
    const values = result.map(r => r.value);
    const messages = result.map(r => r.message);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(3);
    expect(values).toEqual(expect.arrayContaining([
      data, message, undefined
    ]));
    expect(messages).toEqual(expect.arrayContaining([
      'Invalid value `data`.',
      'Invalid value `message`.',
      '`message` or `data` is required.'
    ]));
  });

  it('should return an error when both data and message are defined', () => {
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: {},
        message: 'message'
      })
    ];

    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(1);
    expect(result[0].value).toBeUndefined();
    expect(result[0].message).toMatch('Only one of `message` or `data` should be defined.');
  });

  it('should return an empty error array when body is valid', () => {
    const body = [
      Object.assign({}, loggingEntryBase, {
        data: {}
      }),
      Object.assign({}, loggingEntryBase, {
        message: 'message'
      })
    ];

    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(0);
  });
});
