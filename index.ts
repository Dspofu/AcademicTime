import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes';
import userRoutes from './src/routes/user.routes';
import professorRoutes from './src/routes/professor.routes';
import subjectRoutes from './src/routes/subject.routes';
import offeringRoutes from './src/routes/offering.routes';
import settingsRoutes from './src/routes/settings.routes';
import { solverRoutes } from './src/routes/solver.routes';
import allocationRoutes from './src/routes/allocation.routes';
import reportRoutes from './src/routes/report.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/professors', professorRoutes);
app.use('/subjects', subjectRoutes);
app.use('/offerings', offeringRoutes);
app.use('/settings', settingsRoutes);
app.use('/solver', solverRoutes);
app.use('/allocations', allocationRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('Academic Time API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});