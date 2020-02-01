
const { validatorUtils } = require('../../../../src/components/validators');

describe('validatorUtils.isString', () => {
  it('should return true for a string', () => {
    const value = 'this is a string';
    const result = validatorUtils.isString(value);
    expect(result).toBeTruthy();
  });

  it('should return true for a string object ', () => {
    const value = String(123456);
    const result = validatorUtils.isString(value);
    expect(result).toBeTruthy();
  });

  it('should return false for a number ', () => {
    const value = 123456;
    const result = validatorUtils.isString(value);
    expect(result).toBeFalsy();
  });

  it('should return false for a non-string object ', () => {
    const result = validatorUtils.isString({ value: 'string' });
    expect(result).toBeFalsy();
  });

  it('should return false for an array', () => {
    const result = validatorUtils.isString([{ value: 'string' }]);
    expect(result).toBeFalsy();
  });

  it('should return false for a function', () => {
    const value = x => String(x);
    const result = validatorUtils.isString(value);
    expect(result).toBeFalsy();
  });
});
