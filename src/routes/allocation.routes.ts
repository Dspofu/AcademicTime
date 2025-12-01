import { Router } from 'express';
import { getAllocations, clearAllocations } from '../controllers/allocation.controller';

const router = Router();

router.get('/', getAllocations);
router.delete('/', clearAllocations);

export default router;
