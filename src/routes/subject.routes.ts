import { Router } from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/subject.controller';

const router = Router();

router.get('/', getSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
