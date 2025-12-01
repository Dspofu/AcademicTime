import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get a valid Professor
        const professor = await prisma.professor.findFirst();
        if (!professor) {
            console.error('No professor found. Cannot test offering creation.');
            return;
        }
        console.log('Found Professor:', professor.id_professor);

        // 2. Get a valid Discipline
        const discipline = await prisma.disciplina.findFirst();
        if (!discipline) {
            console.error('No discipline found. Cannot test offering creation.');
            return;
        }
        console.log('Found Discipline:', discipline.id_disciplina);

        // 3. Try to create Offering
        console.log('Attempting to create offering...');
        const offering = await prisma.ofertaDisciplina.create({
            data: {
                id_disciplina: discipline.id_disciplina,
                id_professor: professor.id_professor,
                turma_sufixo: 'TEST_A',
                aulas_semanais_exigidas: 4,
                is_pie: false,
                tipo_recurso_exigido: 'SALA_COMUM',
                capacidade_minima: 30,
                permite_geminada: true
            }
        });
        console.log('Offering created successfully:', offering);

    } catch (error) {
        console.error('ERROR CREATING OFFERING:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
