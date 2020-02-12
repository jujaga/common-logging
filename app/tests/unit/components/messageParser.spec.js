const moment = require('moment');

const helper = require('../../common/helper');
const messageParser = require('../../../src/components/messageParser');

helper.logHelper();

const azp = 'TEST_SERVICE_CLIENT';
const now = moment.utc().valueOf();
const clogs = {
  client: azp,
  data: {},
  level: 'info',
  retention: 'default',
  timestamp: now
};
const loggingEntryBase = {
  level: 'info',
  pattern: '%{GREEDYDATA:test}',
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

describe('parse', () => {
  it('should return an object when input is undefined', async () => {
    const result = await messageParser.parse(undefined, undefined);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return an object when input is missing message and data', async () => {
    const result = await messageParser.parse(azp, loggingEntryBase);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return a correct object when input has data and level', async () => {
    const level = 'warn';
    const data = { level: level };
    const obj = Object.assign({}, loggingEntryBase, { data: data, level: level });

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toEqual(data);
    expect(result.clogs.data.level).toEqual(level);
    expect(result.clogs.level).toEqual(level);
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return a correct object when input has data and retention', async () => {
    const data = { foo: 'bar' };
    const retention = 'test';
    const obj = Object.assign({}, loggingEntryBase, { data: data, retention: retention });

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toEqual(data);
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual(retention);
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return a correct object when input has a message and no pattern', async () => {
    const message = 'message';
    const obj = Object.assign({}, loggingEntryBase, { message: message });
    delete obj.pattern;

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toBeTruthy();
    expect(result.clogs.data.message).toEqual(message);
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return a correct object when input has a level prefixed message and no pattern', async () => {
    const level = 'warn';
    const message = 'message';
    const obj = Object.assign({}, loggingEntryBase, { message: `${level} ${message}` });
    delete obj.pattern;

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toBeTruthy();
    expect(result.clogs.data.message).toEqual(message);
    expect(result.clogs.level).toEqual(level);
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return a correct object when input has a message and invalid grok pattern', async () => {
    const message = 'message';
    const pattern = 'garbage';
    const obj = Object.assign({}, loggingEntryBase, { message: message, pattern: pattern });

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toBeTruthy();
    expect(result.clogs.data.message).toEqual(message);
    expect(result.clogs.data.pattern).toEqual(pattern);
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');
  });

  it('should return a correct object when input has a message and valid grok pattern', async () => {
    const message = 'message';
    const obj = Object.assign({}, loggingEntryBase, { message: message });

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toBeTruthy();
    expect(result.clogs.data.test).toEqual(message);
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('dev');

  });

  it('should return a correct object when input has a env field', async () => {
    const message = 'message';
    const obj = Object.assign({}, loggingEntryBase, { message: message }, {env: 'my-env'}, {metadata: {sub: {field: 'value'}}});

    const result = await messageParser.parse(azp, obj);

    expect(result).toBeTruthy();
    expect(result.clogs).toBeTruthy();
    expect(result.clogs.client).toEqual(azp);
    expect(result.clogs.data).toBeTruthy();
    expect(result.clogs.data.test).toEqual(message);
    expect(result.clogs.level).toEqual('info');
    expect(result.clogs.retention).toEqual('default');
    expect(result.clogs.timestamp).toBeTruthy();
    expect(result.clogs.env).toEqual('my-env');
    expect(result.clogs.sub.field).toEqual('value');

  });

});
