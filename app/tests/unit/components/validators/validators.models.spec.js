const helper = require('../../../common/helper');

const { models } = require('../../../../src/components/validators');

helper.logHelper();

describe('models.loggingEntry.data', () => {
  it('should return true if undefined', () => {
    const value = undefined;
    const result = models.loggingEntry.data(value);
    expect(result).toBeTruthy();
  });

  it('should return true if null', () => {
    const value = null;
    const result = models.loggingEntry.data(value);
    expect(result).toBeTruthy();
  });

  it('should return true if valid object', () => {
    const value = {};
    const result = models.loggingEntry.data(value);
    expect(result).toBeTruthy();
  });

  it('should return true if empty string', () => {
    const value = '';
    const result = models.loggingEntry.data(value);
    expect(result).toBeTruthy();
  });

  it('should return false if not an object', () => {
    const value = () => { };
    const result = models.loggingEntry.data(value);
    expect(result).toBeFalsy();
  });
});

describe('models.loggingEntry.level', () => {
  it('should return true if undefined', () => {
    const value = undefined;
    const result = models.loggingEntry.level(value);
    expect(result).toBeTruthy();
  });

  it('should return true if null', () => {
    const value = null;
    const result = models.loggingEntry.level(value);
    expect(result).toBeTruthy();
  });

  it('should return true if empty string', () => {
    const value = '';
    const result = models.loggingEntry.level(value);
    expect(result).toBeTruthy();
  });

  it('should return true if string', () => {
    const value = 'info';
    const result = models.loggingEntry.level(value);
    expect(result).toBeTruthy();
  });

  it('should return false if not string', () => {
    const value = () => { };
    const result = models.loggingEntry.level(value);
    expect(result).toBeFalsy();
  });
});

describe('models.loggingEntry.message', () => {
  it('should return true if undefined', () => {
    const value = undefined;
    const result = models.loggingEntry.message(value);
    expect(result).toBeTruthy();
  });

  it('should return true if null', () => {
    const value = null;
    const result = models.loggingEntry.message(value);
    expect(result).toBeTruthy();
  });

  it('should return true if empty string', () => {
    const value = '';
    const result = models.loggingEntry.message(value);
    expect(result).toBeTruthy();
  });

  it('should return true if string', () => {
    const value = 'test';
    const result = models.loggingEntry.message(value);
    expect(result).toBeTruthy();
  });

  it('should return false if not string', () => {
    const value = () => { };
    const result = models.loggingEntry.message(value);
    expect(result).toBeFalsy();
  });
});

describe('models.loggingEntry.pattern', () => {
  it('should return true if undefined', () => {
    const value = undefined;
    const result = models.loggingEntry.pattern(value);
    expect(result).toBeTruthy();
  });

  it('should return true if null', () => {
    const value = null;
    const result = models.loggingEntry.pattern(value);
    expect(result).toBeTruthy();
  });

  it('should return true if empty string', () => {
    const value = '';
    const result = models.loggingEntry.pattern(value);
    expect(result).toBeTruthy();
  });

  it('should return true if string', () => {
    const value = 'test';
    const result = models.loggingEntry.pattern(value);
    expect(result).toBeTruthy();
  });

  it('should return false if not string', () => {
    const value = () => { };
    const result = models.loggingEntry.pattern(value);
    expect(result).toBeFalsy();
  });
});

describe('models.loggingEntry.retention', () => {
  it('should return true if undefined', () => {
    const value = undefined;
    const result = models.loggingEntry.retention(value);
    expect(result).toBeTruthy();
  });

  it('should return true if null', () => {
    const value = null;
    const result = models.loggingEntry.retention(value);
    expect(result).toBeTruthy();
  });

  it('should return true if empty string', () => {
    const value = '';
    const result = models.loggingEntry.retention(value);
    expect(result).toBeTruthy();
  });

  it('should return true if string', () => {
    const value = 'default';
    const result = models.loggingEntry.retention(value);
    expect(result).toBeTruthy();
  });

  it('should return false if not string', () => {
    const value = () => { };
    const result = models.loggingEntry.retention(value);
    expect(result).toBeFalsy();
  });
});
