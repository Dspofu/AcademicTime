import { Router } from 'express';
import { getMetrics, exportReport, publishSchedule } from '../controllers/report.controller';

const router = Router();

router.get('/metrics', getMetrics);
router.get('/export/:format', exportReport);
router.post('/publish', publishSchedule);

export default router;
