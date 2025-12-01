import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    const { perfil, email } = req.query;
    try {
        const where: any = {};
        if (perfil) where.perfil = String(perfil);
        if (email) where.email = { contains: String(email) };

        const users = await prisma.usuario.findMany({
            where,
            include: { professor: true },
        });

        // Remove password hash from response
        const safeUsers = users.map((user: any) => {
            const { senha_hash, ...rest } = user;
            return rest;
        });

        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password, perfil, id_professor_vinculado } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.usuario.create({
            data: {
                email,
                senha_hash: hashedPassword,
                perfil,
                id_professor_vinculado,
            },
        });
        const { senha_hash, ...safeUser } = user;
        res.status(201).json(safeUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email, perfil, ativo, id_professor_vinculado, password } = req.body;
    try {
        const data: any = { email, perfil, ativo, id_professor_vinculado };
        if (password) {
            data.senha_hash = await bcrypt.hash(password, 10);
        }

        const user = await prisma.usuario.update({
            where: { id_usuario: id },
            data,
        });
        const { senha_hash, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.usuario.delete({ where: { id_usuario: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
