import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllocations = async (req: Request, res: Response): Promise<void> => {
    try {
        const allocations = await prisma.alocacao.findMany({
            include: {
                oferta: {
                    include: {
                        disciplina: true,
                        professor: true
                    }
                },
                sala: true,
                dia: true,
                slot: true
            }
        });
        res.json(allocations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching allocations' });
    }
};

export const clearAllocations = async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.alocacao.deleteMany();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error clearing allocations' });
    }
};
