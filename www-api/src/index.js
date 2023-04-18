require('dotenv').config({ path: '../.env' });

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const randomUUID = require('crypto').randomUUID;
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const loggerExpress = require('pino-http')({
  // Reuse an existing logger instance
  logger: logger,

  // Define a custom request id function
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers['x-request-id'];
    if (existingID) return existingID;
    id = randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },

  // Define custom serializers
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Set to `false` to prevent standard serializers from being wrapped.
  wrapSerializers: true,

  // Define a custom logger level
  customLogLevel: function (req, res, err) {
    if (res.statusCode === 404 && req.url === '/favicon.ico') {
      return 'silent';
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }

    //else if (res.statusCode >= 300 && res.statusCode < 400) {
    //return 'silent';
    //}
    return 'info';
  },

  // Define a custom success message
  //customSuccessMessage: function (req, res) {
  //  if (res.statusCode === 404) {
  //    return 'resource not found';
  //  }
  //  return `${req.method} completed`;
  //},

  // Define a custom receive message
  //customReceivedMessage: function (req, res) {
  //  return 'request received: ' + req.method;
  //},

  // customReceivedMessage: function (req, res) {
  //  return `${req.method} ${req.url} ${req.headers['x-request-id']}`;
  //},

  customSuccessMessage: function (req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  // Define a custom error message
  customErrorMessage: function (req, res, err) {
    return `${req.method} ${req.url} ${res.statusCode} ${err.message}`;
  },
  //  return 'request errored with status code: ' + res.statusCode;
  //},

  // Override attribute keys for the log object
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'timeTaken',
  },

  // Define additional custom request properties
  customProps: function (req, res) {
    return {
      customProp: req.customProp,
      // user request-scoped data is in res.locals for express applications
      customProp2: res.locals.myCustomData,
    };
  },
});

const middlewares = require('./middlewares/common');
const pins = require('./routes/pins');
const channels = require('./routes/channels');
const users = require('./routes/users');

const api_port = process.env.API_PORT || 5000;
const hostname = process.env.HOSTNAME || 'localhost';
const datapath = process.env.DATA_PATH || './data';

if (!fs.existsSync(datapath + '/pins')) fs.mkdirSync(datapath + '/pins');

const app = express();
app.use(loggerExpress);

//allow all origin for other docker containers
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.logger = logger;
  next();
});
app.get('/', middlewares.noIndexHandler);
app.use('/pins', pins);
app.use('/channels', channels);
app.use('/users', users);
app.use(middlewares.errorHandler);

app.listen(api_port, () =>
  pino().info(
    `npc-historian-internal-api listening on port http://${hostname}:${api_port}/ !`
  )
);
