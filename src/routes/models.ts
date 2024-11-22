import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import PlaceRouter from './models/places';
import LocationRouter from './models/locations';
import BuildingeRouter from './models/buildings';
import IndicationRouter from './models/indications';
import GroupRouter from './models/group';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);

router.use('/place', PlaceRouter);
router.use('/location', LocationRouter);
router.use('/building', BuildingeRouter);
router.use('/indication', IndicationRouter);
router.use('/group', GroupRouter);

export default router;
