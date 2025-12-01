import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getProfessors = async (req: Request, res: Response): Promise<void> => {
    try {
        const professors = await prisma.professor.findMany({
            include: {
                diasIndesejados: true,
                modalidadesPref: true,
            },
        });
        res.json(professors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching professors' });
    }
};

export const getProfessorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const professor = await prisma.professor.findUnique({
            where: { id_professor: id },
            include: {
                diasIndesejados: true,
                modalidadesPref: true,
            },
        });
        if (!professor) {
            res.status(404).json({ message: 'Professor not found' });
            return;
        }
        res.json(professor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching professor' });
    }
};

export const createProfessor = async (req: Request, res: Response): Promise<void> => {
    const { nome, email, carga_horaria_meta, is_substituto, prefere_aulas_geminadas, diasIndesejados, modalidadesPref } = req.body;
    try {
        const professor = await prisma.professor.create({
            data: {
                nome,
                email,
                carga_horaria_meta,
                is_substituto,
                prefere_aulas_geminadas,
                diasIndesejados: {
                    create: diasIndesejados?.map((dia: any) => ({
                        id_dia: typeof dia === 'string' ? dia : (typeof dia.id_dia === 'string' ? dia.id_dia : dia.id_dia?.id_dia)
                    })),
                },
                modalidadesPref: {
                    create: modalidadesPref?.map((mod: any) => ({
                        modalidade: typeof mod === 'string' ? mod : (typeof mod.modalidade === 'string' ? mod.modalidade : mod.modalidade?.modalidade)
                    })),
                },
            },
            include: {
                diasIndesejados: true,
                modalidadesPref: true,
            },
        });
        res.status(201).json(professor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating professor' });
    }
};

export const updateProfessor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nome, email, carga_horaria_meta, is_substituto, prefere_aulas_geminadas, diasIndesejados, modalidadesPref } = req.body;
    try {
        // Transaction to handle relations update
        const professor = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Update basic fields
            const updated = await tx.professor.update({
                where: { id_professor: id },
                data: {
                    nome,
                    email,
                    carga_horaria_meta,
                    is_substituto,
                    prefere_aulas_geminadas,
                },
            });

            // 2. Update diasIndesejados if provided
            if (diasIndesejados) {
                await tx.professorDiaIndesejado.deleteMany({ where: { id_professor: id } });
                await tx.professorDiaIndesejado.createMany({
                    data: diasIndesejados.map((dia: any) => {
                        const id_dia = typeof dia === 'string' ? dia : (typeof dia.id_dia === 'string' ? dia.id_dia : dia.id_dia?.id_dia);
                        return { id_professor: id, id_dia };
                    }),
                });
            }

            // 3. Update modalidadesPref if provided
            if (modalidadesPref) {
                await tx.professorModalidadePref.deleteMany({ where: { id_professor: id } });
                await tx.professorModalidadePref.createMany({
                    data: modalidadesPref.map((mod: any) => {
                        const modalidade = typeof mod === 'string' ? mod : (typeof mod.modalidade === 'string' ? mod.modalidade : mod.modalidade?.modalidade);
                        return { id_professor: id, modalidade };
                    }),
                });
            }

            return tx.professor.findUnique({
                where: { id_professor: id },
                include: { diasIndesejados: true, modalidadesPref: true },
            });
        });

        res.json(professor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating professor' });
    }
};

export const deleteProfessor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // Delete relations first (cascade usually handles this but good to be explicit or rely on schema)
        // Prisma schema doesn't have onDelete: Cascade explicitly set for relations in the provided schema, 
        // so we might need to delete manually or update schema. 
        // Let's assume we need to delete relations first.
        await prisma.professorDiaIndesejado.deleteMany({ where: { id_professor: id } });
        await prisma.professorModalidadePref.deleteMany({ where: { id_professor: id } });
        await prisma.professor.delete({ where: { id_professor: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting professor' });
    }
};
