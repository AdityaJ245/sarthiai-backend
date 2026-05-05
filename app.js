'use strict';

const compression = require('compression');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { authRouter } = require('./routes/auth');
const { usersRouter } = require('./routes/users');
const { adminRouter } = require('./routes/admin');
const { mealsRouter } = require('./routes/meals');
const { summaryRouter } = require('./routes/summary');
const { integrationsRouter } = require('./routes/integrations');

/**
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  const corsOrigin = env.CORS_ORIGIN === undefined ? true : env.CORS_ORIGIN;
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authLimiter, authRouter);
  app.use('/users', authLimiter, usersRouter);
  app.use('/meals', authLimiter, mealsRouter);
  app.use('/summary', authLimiter, summaryRouter);
  app.use('/integrations', authLimiter, integrationsRouter);
  app.use('/admin', authLimiter, adminRouter);

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
