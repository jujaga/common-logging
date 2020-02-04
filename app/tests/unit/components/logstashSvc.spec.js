const axios = require('axios');
const config = require('config');
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

  afterAll(() => {
    logSpy.mockRestore();
  });

  it('should return nothing on success', () => {
    logSpy.mockResolvedValue(undefined);
    const result = logstashSvc.logMany([clogs]);

    expect(result).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(clogs);
  });

  it('should return an array of CLOGS objects', () => {
    const problem = new Problem(500);
    logSpy.mockImplementation(() => { throw problem; });
    const result = logstashSvc.logMany([clogs]);

    expect(result).rejects.toThrow(problem);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(clogs);
  });
});

describe('log', () => {
  const axiosSpy = jest.spyOn(axios, 'post');
  const axiosOptions = {
    headers: {
      'Content-Type': 'application/json'
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  };
  const url = config.get('elkStack.logstashUrl');

  afterEach(() => {
    axiosSpy.mockReset();
  });

  afterAll(() => {
    axiosSpy.mockRestore();
  });

  it('should return nothing on success', () => {
    axiosSpy.mockResolvedValue({ status: 200 });
    const result = logstashSvc.log(clogs);

    expect(result).resolves.toBeUndefined();
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url, clogs, axiosOptions);
  });

  it('should throw on a non 200 response', () => {
    axiosSpy.mockResolvedValue({ status: 201 });
    const result = logstashSvc.log(clogs);

    expect(result).rejects.toThrow(new Problem(500, 'Unknown LOGSTASH Error'));
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url, clogs, axiosOptions);
  });

  it('should throw on an error response with data', () => {
    const status = 500;
    axiosSpy.mockImplementation(() => {
      throw {
        response: {
          data: {}, status: status
        },
      };
    });
    const result = logstashSvc.log(clogs);

    expect(result).rejects.toThrow(new Problem(status));
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url, clogs, axiosOptions);
  });
});
