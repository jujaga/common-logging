const helper = require('../../common/helper');
const utils = require('../../../src/components/utils');

helper.logHelper();

describe('prettyStringify', () => {
  const obj = {
    foo: 'bar'
  };

  it('should return a formatted json string with 2 space indent', () => {
    const result = utils.prettyStringify(obj);

    expect(result).toBeTruthy();
    expect(result).toEqual('{\n  "foo": "bar"\n}');
  });

  it('should return a formatted json string with 4 space indent', () => {
    const result = utils.prettyStringify(obj, 4);

    expect(result).toBeTruthy();
    expect(result).toEqual('{\n    "foo": "bar"\n}');
  });
});
