import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const subjects = await prisma.disciplina.findMany();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects' });
    }
};

export const createSubject = async (req: Request, res: Response): Promise<void> => {
    const { codigo, nome, carga_horaria_semestral, aulas_por_semana_padrao } = req.body;
    try {
        const subject = await prisma.disciplina.create({
            data: {
                codigo,
                nome,
                carga_horaria_semestral,
                aulas_por_semana_padrao,
            },
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating subject' });
    }
};

export const updateSubject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { codigo, nome, carga_horaria_semestral, aulas_por_semana_padrao } = req.body;
    try {
        const subject = await prisma.disciplina.update({
            where: { id_disciplina: id },
            data: {
                codigo,
                nome,
                carga_horaria_semestral,
                aulas_por_semana_padrao,
            },
        });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Error updating subject' });
    }
};

export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.disciplina.delete({ where: { id_disciplina: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject' });
    }
};
