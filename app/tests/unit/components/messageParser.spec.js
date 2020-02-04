const moment = require('moment');

const helper = require('../../common/helper');
const messageParser = require('../../../src/components/messageParser');

helper.logHelper();

const azp = 'TEST_SERVICE_CLIENT';
const clogs = {
  client: azp,
  data: {},
  level: 'info',
  retention: 'default',
  timestamp: moment.utc().valueOf()
};
const loggingEntryBase = {
  level: 'INFO',
  pattern: '%{GREEDYDATA:data}',
  retention: 'default'
};

describe('parseMany', () => {
  const parseSpy = jest.spyOn(messageParser, 'parse');

  afterEach(() => {
    parseSpy.mockReset();
  });

  afterAll(() => {
    parseSpy.mockRestore();
  });

  it('should return an empty array', async () => {
    parseSpy.mockResolvedValue(clogs);
    const result = await messageParser.parseMany(undefined, []);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(0);
    expect(parseSpy).toHaveBeenCalledTimes(0);
  });

  it('should return an array of CLOGS objects', async () => {
    parseSpy.mockResolvedValue(clogs);
    const obj = [
      Object.assign({}, loggingEntryBase),
      Object.assign({}, loggingEntryBase)
    ];
    const result = await messageParser.parseMany(azp, obj);

    expect(result).toBeTruthy();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(clogs);
    expect(result[1]).toEqual(clogs);
    expect(parseSpy).toHaveBeenCalledTimes(2);
    expect(parseSpy).toHaveBeenCalledWith(azp, loggingEntryBase);
  });
});
