import { PrismaClient } from '@prisma/client';
import { GradeSolverService, OfertaDisciplina, Professor, Sala, DiaSemana, SlotHorario, ConfiguracaoRestricao } from './src/services/GradeSolverService';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SOLVER DEBUGGER ---');

    // 1. Fetch Data
    const ofertas = await prisma.ofertaDisciplina.findMany({ include: { professor: true, disciplina: true } });
    const professores = await prisma.professor.findMany({ include: { diasIndesejados: true, modalidadesPref: true } });
    const salas = await prisma.sala.findMany({ where: { ativa: true } });

    // 2. Map Data
    const solverOfferings: OfertaDisciplina[] = ofertas.map(o => ({
        id_oferta: o.id_oferta,
        id_professor: o.id_professor,
        aulas_semanais_exigidas: o.aulas_semanais_exigidas,
        is_pie: o.is_pie,
        tipo_recurso_exigido: o.tipo_recurso_exigido as 'COMUM' | 'LABORATORIO' | 'AUDITORIO',
        capacidade_minima: o.capacidade_minima,
        modalidade_curso: 'GRADUACAO'
    }));

    const solverProfessors: Professor[] = professores.map(p => ({
        id_professor: p.id_professor,
        dias_indesejados: p.diasIndesejados.map(d => d.id_dia),
        modalidades_preferidas: p.modalidadesPref.map(m => m.modalidade),
    }));

    const solverRooms: Sala[] = salas.map(s => ({
        id_sala: s.id_sala,
        capacidade: s.capacidade,
        tipo_recurso: s.tipo_recurso as 'COMUM' | 'LABORATORIO' | 'AUDITORIO'
    }));

    const dias: DiaSemana[] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'].map(d => ({ id_dia: d }));
    const slots: SlotHorario[] = [1, 2, 3, 4].map(s => ({ id_slot: s }));

    const service = new GradeSolverService();

    // 3. Test Configurations
    const configs = [
        { name: 'DEFAULT (All Active)', config: { peso_dia_indesejado: 10, peso_modalidade_indesejada: 10, ativo_regra_pie: true, ativo_limite_3_aulas_dia: true } },
        { name: 'NO PIE RULE', config: { peso_dia_indesejado: 10, peso_modalidade_indesejada: 10, ativo_regra_pie: false, ativo_limite_3_aulas_dia: true } },
        { name: 'NO MAX 3 CLASSES', config: { peso_dia_indesejado: 10, peso_modalidade_indesejada: 10, ativo_regra_pie: true, ativo_limite_3_aulas_dia: false } },
        { name: 'RELAXED (No Hard Rules)', config: { peso_dia_indesejado: 10, peso_modalidade_indesejada: 10, ativo_regra_pie: false, ativo_limite_3_aulas_dia: false } },
    ];

    for (const test of configs) {
        console.log(`\nTesting Config: ${test.name}...`);
        try {
            // Manually run the logic to get the model (since resolverGrade doesn't return it)
            // We need to modify GradeSolverService or just trust the logic.
            // Let's modify GradeSolverService temporarily to log the model? 
            // No, let's just use the service and catch the error, but we can't see the model inside.

            // ALTERNATIVE: Copy the logic here to debug.
            // Or better: Modify GradeSolverService.ts to write the model to a file if a flag is set?
            // Let's just modify GradeSolverService.ts to console.log the model constraints summary.

            const result = service.resolverGrade(solverOfferings, solverProfessors, solverRooms, dias, slots, test.config);
            console.log(`  SUCCESS! Generated ${result.length} allocations.`);
        } catch (error: any) {
            console.log(`  FAILED: ${error.message}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
