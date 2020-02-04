const request = require('supertest');

const helper = require('../../../common/helper');
const router = require('../../../../src/routes/v1/logging');

const logstashSvc = require('../../../../src/components/logstashSvc');
const messageParser = require('../../../../src/components/messageParser');

// Simple Express Server
const basePath = '/api/v1/log';
const app = helper.expressHelper(basePath, router);
helper.logHelper();

describe(`POST ${basePath}`, () => {
  const logManySpy = jest.spyOn(logstashSvc, 'logMany');
  const parseManySpy = jest.spyOn(messageParser, 'parseMany');

  afterEach(() => {
    logManySpy.mockReset();
    parseManySpy.mockReset();
  });

  it('should yield a validation error response', async () => {
    const response = await request(app).post(`${basePath}`);

    expect(response.statusCode).toBe(422);
    expect(response.body).toBeTruthy();
    expect(response.body.detail).toMatch('Validation failed');
    expect(response.body.errors).toHaveLength(1);
    expect(logManySpy).toHaveBeenCalledTimes(0);
    expect(parseManySpy).toHaveBeenCalledTimes(0);
  });

  it('should yield a created response', async () => {
    logManySpy.mockResolvedValue(null);
    parseManySpy.mockResolvedValue([]);

    const response = await request(app).post(`${basePath}`).send([{ data: {} }]);

    expect(response.statusCode).toBe(201);
    expect(response.body).toBeTruthy();
    expect(Object.keys(response.body)).toHaveLength(0);
    expect(logManySpy).toHaveBeenCalledTimes(1);
    expect(parseManySpy).toHaveBeenCalledTimes(1);
  });

  it('should yield an error and fail gracefully', async () => {
    logManySpy.mockResolvedValue(null);
    parseManySpy.mockRejectedValue(new Error('bad'));

    const response = await request(app).post(`${basePath}`).send([{ data: {} }]);

    expect(response.statusCode).toBe(500);
    expect(response.body).toBeTruthy();
    expect(response.body.details).toBe('bad');
    expect(logManySpy).toHaveBeenCalledTimes(0);
    expect(parseManySpy).toHaveBeenCalledTimes(1);
  });
});
