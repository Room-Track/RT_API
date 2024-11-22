import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import { router as searchRouter } from './interfaces/search';
import { router as infoRouter } from './interfaces/info';
import { router as refRouter } from './interfaces/ref';
import { router as IndicationRouter } from './interfaces/indication';
import { router as NodeRouter } from './interfaces/node';
import PolylineRouter from './interfaces/polyline';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);

router.use('/search', searchRouter);
router.use('/info', infoRouter);
router.use('/ref', refRouter);
router.use('/indication', IndicationRouter);

router.use('/node', NodeRouter);
router.use('/polyline', PolylineRouter);

export default router;
