const request = require('supertest');

const helper = require('../../../common/helper');
const router = require('../../../../src/routes/v1/health');

const healthSvc = require('../../../../src/components/healthSvc');

// Simple Express Server
const basePath = '/api/v1/health';
const app = helper.expressHelper(basePath, router);

describe(`GET ${basePath}`, () => {
  const checkSpy = jest.spyOn(healthSvc, 'check');

  afterEach(() => {
    checkSpy.mockReset();
  });

  it('should return the status of correspondent apis', async () => {
    checkSpy.mockResolvedValue([
      {
        name: 'logstash',
        healthy: true,
        info: 'ok'
      }]);

    const response = await request(app).get(`${basePath}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body.dependencies).toBeTruthy();
    expect(response.body.dependencies).toHaveLength(1);
    expect(response.body.dependencies[0].name).toMatch('logstash');
    expect(response.body.dependencies[0].healthy).toBeTruthy();
    expect(response.body.dependencies[0].info).toBeTruthy();
    expect(response.body.dependencies[0].info).toMatch('ok');
  });

  it('should respond even with an exception', async () => {
    checkSpy.mockResolvedValue([
      {
        name: 'logstash',
        healthy: false,
        info: 'bad'
      }]);


    const response = await request(app).get(`${basePath}`);

    expect(response.body.dependencies).toBeTruthy();
    expect(response.body.dependencies).toHaveLength(1);
    expect(response.body.dependencies[0].name).toMatch('logstash');
    expect(response.body.dependencies[0].healthy).toBeFalsy();
    expect(response.body.dependencies[0].info).toBeTruthy();
    expect(response.body.dependencies[0].info).toMatch('bad');
  });

  it('should fail gracefully when an error occurs', async () => {
    checkSpy.mockImplementation(() => {
      throw new Error();
    });

    const response = await request(app).get(`${basePath}`);

    expect(response.statusCode).toBe(500);
    expect(response.body).toBeTruthy();
    expect(response.body.status).toBe('500');
  });

});
