const moment = require('moment');
const Problem = require('api-problem');

const helper = require('../../common/helper');
const logstashSvc = require('../../../src/components/logstashSvc');

helper.logHelper();

const clogs = {
  client: 'CLIENT',
  data: {},
  level: 'info',
  retention: 'default',
  timestamp: moment.utc().valueOf()
};

describe('logMany', () => {
  const logSpy = jest.spyOn(logstashSvc, 'log');

  afterEach(() => {
    logSpy.mockReset();
  });

  it('should return nothing on success', () => {
    logSpy.mockReturnValue(undefined);

    expect(logstashSvc.logMany([clogs])).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(clogs);
  });

  it('should return an array of CLOGS objects', async () => {
    const problem = new Problem(500);
    logSpy.mockImplementation(() => { throw problem; });

    expect(logstashSvc.logMany([clogs])).rejects.toThrow(problem);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(clogs);
  });
});

describe('log', () => {

});
