const config = require('config');
const router = require('express').Router();
const path = require('path');

const keycloak = require('../components/keycloak');

const loggingRouter = require('./v1/loggingRouter');

const clientId = config.get('keycloak.clientId');

/** Base v1 Responder */
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/log'
    ]
  });
});

/** OpenAPI Docs */
router.get('/docs', (_req, res) => {
  const docs = require('../docs/docs');
  res.send(docs.getDocHTML('v1'));
});

/** OpenAPI YAML Spec */
router.get('/api-spec.yaml', (_req, res) => {
  res.sendFile(path.join(__dirname, '../docs/v1.api-spec.yaml'));
});

/** Doc Gen Router */
router.use('/log', keycloak.protect(`${clientId}:LOGGER`), loggingRouter);

module.exports = router;
