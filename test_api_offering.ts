import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Get valid IDs
    const professor = await prisma.professor.findFirst();
    const discipline = await prisma.disciplina.findFirst();

    if (!professor || !discipline) {
        console.error('Missing data for test');
        return;
    }

    const payload = {
        id_disciplina: discipline.id_disciplina,
        id_professor: professor.id_professor,
        turma_sufixo: 'API_TEST',
        aulas_semanais_exigidas: 4,
        is_pie: false,
        tipo_recurso_exigido: 'SALA_COMUM',
        capacidade_minima: 30,
        permite_geminada: true
    };

    console.log('Sending payload:', payload);

    // 2. Send POST request
    try {
        const response = await fetch('http://localhost:3001/offerings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', data);
    } catch (error) {
        console.error('Request failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
