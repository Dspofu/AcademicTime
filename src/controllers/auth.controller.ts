import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
            include: { professor: true },
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.senha_hash);

        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id_usuario, perfil: user.perfil }, JWT_SECRET, {
            expiresIn: '1d',
        });

        // Remove password from response
        const { senha_hash, ...userWithoutPassword } = user;

        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    // Mock implementation
    console.log(`Forgot password for ${email}`);
    res.json({ message: 'Email enviado com sucesso' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    // Mock implementation
    console.log(`Reset password with token ${token}`);
    res.json({ message: 'Senha alterada com sucesso' });
};
