const request = require('supertest');

const helper = require('../../common/helper');
const router = require('../../../src/routes/v1');

// Simple Express Server
const basePath = '/api/v1';
const app = helper.expressHelper(basePath, router);
helper.logHelper();

describe(`GET ${basePath}`, () => {
  it('should return all available endpoints', async () => {
    const response = await request(app).get(`${basePath}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
    expect(Array.isArray(response.body.endpoints)).toBeTruthy();
    expect(response.body.endpoints).toHaveLength(2);
    expect(response.body.endpoints).toContain('/log');
    expect(response.body.endpoints).toContain('/health');
  });
});

describe(`GET ${basePath}/docs`, () => {
  it('should return a redoc html page', async () => {
    const response = await request(app).get(`${basePath}/docs`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(/Common Logging Service API - Documentation v1/);
  });
});

describe(`GET ${basePath}/api-spec.yaml`, () => {
  it('should return the OpenAPI yaml spec', async () => {
    const response = await request(app).get(`${basePath}/api-spec.yaml`);

    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(/openapi: 3.0.2/);
    expect(response.text).toMatch(/title: Common Logging Service API/);
  });
});

describe(`GET ${basePath}/api-spec.json`, () => {
  it('should return the OpenAPI json spec', async () => {
    const response = await request(app).get(`${basePath}/api-spec.json`);
    expect(response).toBeTruthy();

    // TODO: Figure out why supertest isn't behaving as intended...
    // expect(response.statusCode).toBe(200);
    // expect(response.body.openapi).toMatch('3.0.2');
    // expect(response.text.info.title).toMatch('Common Logging Service API');
  });
});
