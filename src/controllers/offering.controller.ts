import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getOfferings = async (req: Request, res: Response): Promise<void> => {
    try {
        const offerings = await prisma.ofertaDisciplina.findMany({
            include: {
                disciplina: true,
                professor: true,
            },
        });
        res.json(offerings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offerings' });
    }
};

export const createOffering = async (req: Request, res: Response): Promise<void> => {
    console.log('Received payload for createOffering:', req.body);
    const { id_disciplina, id_professor, turma_sufixo, aulas_semanais_exigidas, is_pie, tipo_recurso_exigido, capacidade_minima, permite_geminada } = req.body;
    try {
        const offering = await prisma.ofertaDisciplina.create({
            data: {
                id_disciplina,
                id_professor,
                turma_sufixo,
                aulas_semanais_exigidas,
                is_pie,
                tipo_recurso_exigido,
                capacidade_minima,
                permite_geminada,
            },
            include: {
                disciplina: true,
                professor: true,
            },
        });
        res.status(201).json(offering);
    } catch (error) {
        console.error('Error creating offering:', error);
        res.status(500).json({ message: 'Error creating offering', error: String(error) });
    }
};

export const updateOffering = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { id_disciplina, id_professor, turma_sufixo, aulas_semanais_exigidas, is_pie, tipo_recurso_exigido, capacidade_minima, permite_geminada } = req.body;
    try {
        const offering = await prisma.ofertaDisciplina.update({
            where: { id_oferta: id },
            data: {
                id_disciplina,
                id_professor,
                turma_sufixo,
                aulas_semanais_exigidas,
                is_pie,
                tipo_recurso_exigido,
                capacidade_minima,
                permite_geminada,
            },
            include: {
                disciplina: true,
                professor: true,
            },
        });
        res.json(offering);
    } catch (error) {
        res.status(500).json({ message: 'Error updating offering' });
    }
};

export const deleteOffering = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.ofertaDisciplina.delete({ where: { id_oferta: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting offering' });
    }
};
