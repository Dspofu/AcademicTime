import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const CONFIG_ID = 'CONFIG-PADRAO';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let config = await prisma.configuracaoRestricao.findUnique({
            where: { id_config: CONFIG_ID },
        });

        if (!config) {
            // Create default if not exists
            config = await prisma.configuracaoRestricao.create({
                data: {
                    id_config: CONFIG_ID,
                    peso_dia_indesejado: 10,
                    peso_modalidade_indesejada: 5,
                    peso_preferencia_geminada: 2,
                    peso_evitar_janelas: 20,
                    ativo_regra_pie: true,
                    ativo_limite_3_aulas_dia: true,
                    tempo_maximo_execucao_seg: 300,
                },
            });
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    const {
        peso_dia_indesejado,
        peso_modalidade_indesejada,
        peso_preferencia_geminada,
        peso_evitar_janelas,
        ativo_regra_pie,
        ativo_limite_3_aulas_dia,
        tempo_maximo_execucao_seg,
    } = req.body;

    try {
        const config = await prisma.configuracaoRestricao.upsert({
            where: { id_config: CONFIG_ID },
            update: {
                peso_dia_indesejado,
                peso_modalidade_indesejada,
                peso_preferencia_geminada,
                peso_evitar_janelas,
                ativo_regra_pie,
                ativo_limite_3_aulas_dia,
                tempo_maximo_execucao_seg,
            },
            create: {
                id_config: CONFIG_ID,
                peso_dia_indesejado,
                peso_modalidade_indesejada,
                peso_preferencia_geminada,
                peso_evitar_janelas,
                ativo_regra_pie,
                ativo_limite_3_aulas_dia,
                tempo_maximo_execucao_seg,
            },
        });

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings' });
    }
};
