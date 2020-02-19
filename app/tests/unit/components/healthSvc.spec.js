const axios = require('axios');
const config = require('config');

const helper = require('../../common/helper');
const healthSvc = require('../../../src/components/healthSvc');

helper.logHelper();

describe('check', () => {
  const axiosSpy = jest.spyOn(axios, 'get');
  const url = config.get('elkStack.logstashUrl');

  afterEach(() => {
    axiosSpy.mockReset();
  });

  afterAll(() => {
    axiosSpy.mockRestore();
  });

  it('should handle a 200 response gracefully, healthy should be true', async () => {
    axiosSpy.mockResolvedValue({status: 200, data: 'ok'});
    const result = await healthSvc.check();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('logstash');
    expect(result[0].healthy).toBeTruthy();
    expect(result[0].info).toBe('ok');
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url);
  });

  it('should handle a non 200 response gracefully, healthy should be false', async () => {
    axiosSpy.mockResolvedValue({status: 201, data: 'ok'});
    const result = await healthSvc.check();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('logstash');
    expect(result[0].healthy).toBeFalsy();
    expect(result[0].info).toBe('ok');
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url);
  });

  it('should handle a 500 gracefully, healthy should be false', async () => {
    axiosSpy.mockImplementation(() => {
      throw {
        response: {
          data: {}, status: 500
        },
      };
    });
    const result = await healthSvc.check();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('logstash');
    expect(result[0].healthy).toBeFalsy();
    expect.stringMatching(result[0].info, /500/);
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url);
  });

  it('should handle an exception gracefully, healthy should be false', async () => {
    axiosSpy.mockImplementation(() => {
      throw new Error();
    });
    const result = await healthSvc.check();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('logstash');
    expect(result[0].healthy).toBeFalsy();
    expect.stringMatching(result[0].info, /unknown error/);
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy).toHaveBeenCalledWith(url);
  });
});
