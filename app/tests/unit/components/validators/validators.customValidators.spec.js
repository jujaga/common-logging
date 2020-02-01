const helper = require('../../../common/helper');

const { customValidators } = require('../../../../src/components/validators');

helper.logHelper();

describe('customValidators.logging', () => {
  it('should return an error when input is not array', () => {
    const body = {};
    const result = customValidators.logging(body);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toEqual(1);
    expect(result[0].value).toEqual(body);
    expect(result[0].message).toMatch('Invalid value `logging`. Expect an array of logging entries.');
  });
});
