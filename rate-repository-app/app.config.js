// app.config.js
import 'dotenv/config';

export default {
  name: 'rate-repository-app',
  version: '1.0.0',
  extra: {
    env: process.env.ENV,
    apolloUri: process.env.APOLLO_URI,
  },
};