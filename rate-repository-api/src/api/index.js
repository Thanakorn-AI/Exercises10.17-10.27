// rate-repository-api/src/api/index.js
import Router from 'koa-router';

import repositories from './repositories';

const router = new Router();

router.use('/repositories', repositories.routes());

export default router;
