'use strict';

const mongoose = require('mongoose');
const { env } = require('./config/env');
const { createApp } = require('./app');

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
