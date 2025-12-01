import { Router } from 'express';
import { SolverController } from '../controllers/solver.controller';

const solverRoutes = Router();
const solverController = new SolverController();

solverRoutes.post('/generate', solverController.generate);

export { solverRoutes };
