import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalAllocations = await prisma.alocacao.count();
        const totalOfferings = await prisma.ofertaDisciplina.count();
        const totalProfessors = await prisma.professor.count();

        // Mock satisfaction metrics for now
        const metrics = {
            totalClasses: totalAllocations,
            conflicts: 0, // We assume solver generates conflict-free schedule
            satisfaction: 95, // Mock value
            distribution: {
                morning: 40,
                afternoon: 30,
                night: 30
            },
            coverage: totalOfferings > 0 ? Math.round((totalAllocations / (totalOfferings * 4)) * 100) : 0 // Approx
        };

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching metrics' });
    }
};

export const exportReport = async (req: Request, res: Response): Promise<void> => {
    const { format } = req.params;

    try {
        if (format === 'csv') {
            const allocations = await prisma.alocacao.findMany({
                include: {
                    oferta: { include: { disciplina: true, professor: true } },
                    sala: true,
                    dia: true,
                    slot: true
                }
            });

            // Simple CSV generation
            const header = 'Dia,Horario,Disciplina,Professor,Sala,Turma\n';
            const rows = allocations.map(a =>
                `${a.dia.nome},${a.slot.horario_inicio}-${a.slot.horario_fim},${a.oferta.disciplina.nome},${a.oferta.professor.nome},${a.sala.nome_codigo},${a.oferta.turma_sufixo}`
            ).join('\n');

            res.header('Content-Type', 'text/csv');
            res.attachment('grade_horaria.csv');
            res.send(header + rows);
        } else if (format === 'pdf') {
            // Mock PDF response
            res.json({ message: 'PDF export not implemented yet, please use CSV' });
        } else {
            res.status(400).json({ message: 'Invalid format' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error exporting report' });
    }
};

export const publishSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        // In a real app, this might update a status flag or send emails
        console.log('Schedule published!');
        res.json({ message: 'Grade publicada com sucesso', status: 'PUBLISHED', publishedAt: new Date() });
    } catch (error) {
        res.status(500).json({ message: 'Error publishing schedule' });
    }
};
