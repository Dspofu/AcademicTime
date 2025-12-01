import { Router } from 'express';
import { getProfessors, getProfessorById, createProfessor, updateProfessor, deleteProfessor } from '../controllers/professor.controller';

const router = Router();

router.get('/', getProfessors);
router.get('/:id', getProfessorById);
router.post('/', createProfessor);
router.put('/:id', updateProfessor);
router.delete('/:id', deleteProfessor);

export default router;
