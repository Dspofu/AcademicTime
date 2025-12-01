import { Router } from 'express';
import { getOfferings, createOffering, updateOffering, deleteOffering } from '../controllers/offering.controller';

const router = Router();

router.get('/', getOfferings);
router.post('/', createOffering);
router.put('/:id', updateOffering);
router.delete('/:id', deleteOffering);

export default router;
