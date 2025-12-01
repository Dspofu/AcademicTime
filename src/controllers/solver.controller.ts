import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { GradeSolverService, OfertaDisciplina, Professor, Sala, DiaSemana, SlotHorario, ConfiguracaoRestricao } from '../services/GradeSolverService';

export class SolverController {
    async generate(req: Request, res: Response) {
        try {
            const { config } = req.body;

            // 1. Fetch Data from Database
            const ofertas = await prisma.ofertaDisciplina.findMany({
                include: {
                    professor: true,
                    disciplina: true,
                },
            });

            const professores = await prisma.professor.findMany({
                include: {
                    diasIndesejados: true,
                    modalidadesPref: true
                }
            });

            const salas = await prisma.sala.findMany({
                where: { ativa: true }
            });

            // MAPPING TO SOLVER INTERFACES

            // Map Offerings
            const solverOfferings: OfertaDisciplina[] = ofertas.map(o => ({
                id_oferta: o.id_oferta,
                id_professor: o.id_professor,
                aulas_semanais_exigidas: o.aulas_semanais_exigidas,
                is_pie: o.is_pie,
                tipo_recurso_exigido: o.tipo_recurso_exigido as 'COMUM' | 'LABORATORIO' | 'AUDITORIO',
                capacidade_minima: o.capacidade_minima,
                modalidade_curso: 'GRADUACAO' // Default, as it's not in the schema yet
            }));

            // Map Professors
            const solverProfessors: Professor[] = professores.map(p => ({
                id_professor: p.id_professor,
                dias_indesejados: p.diasIndesejados.map(d => d.id_dia),
                modalidades_preferidas: p.modalidadesPref.map(m => m.modalidade),
                carga_horaria_meta: p.carga_horaria_meta
            }));

            // Map Rooms
            const solverRooms: Sala[] = salas.map(s => ({
                id_sala: s.id_sala,
                capacidade: s.capacidade,
                tipo_recurso: s.tipo_recurso as 'COMUM' | 'LABORATORIO' | 'AUDITORIO'
            }));

            // Days and Slots (Fixed for now, could be fetched)
            const dias: DiaSemana[] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'].map(d => ({ id_dia: d }));
            const slots: SlotHorario[] = [1, 2, 3, 4].map(s => ({ id_slot: s }));

            // Config
            const solverConfig: ConfiguracaoRestricao = {
                peso_dia_indesejado: config?.peso_dia_indesejado || 10,
                peso_modalidade_indesejada: config?.peso_modalidade_indesejada || 10,
                ativo_regra_pie: config?.ativo_regra_pie ?? true,
                ativo_limite_3_aulas_dia: config?.ativo_limite_3_aulas_dia ?? true,
            };

            // 2. Run Solver
            const service = new GradeSolverService();
            const result = service.resolverGrade(
                solverOfferings,
                solverProfessors,
                solverRooms,
                dias,
                slots,
                solverConfig
            );

            // 3. Save Result to Database
            // First, clear existing allocations (optional: could be a parameter to keep or replace)
            await prisma.alocacao.deleteMany({});

            // Bulk create allocations
            if (result.length > 0) {
                await prisma.alocacao.createMany({
                    data: result.map(r => ({
                        id_oferta: r.id_oferta,
                        id_dia: r.id_dia,
                        id_slot: r.id_slot,
                        id_sala: r.id_sala
                    }))
                });
            }

            console.log(`Saved ${result.length} allocations to database.`);

            // 4. Return Result
            return res.json(result);

        } catch (error: any) {
            console.error('Solver error:', error);
            return res.status(500).json({ error: 'Failed to generate schedule', details: error.message });
        }
    }
}
