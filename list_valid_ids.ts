import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- VALID PROFESSORS ---');
    const professors = await prisma.professor.findMany({
        select: { id_professor: true, nome: true }
    });
    professors.forEach(p => console.log(`${p.id_professor} - ${p.nome}`));

    console.log('\n--- VALID DISCIPLINES ---');
    const disciplines = await prisma.disciplina.findMany({
        select: { id_disciplina: true, nome: true, codigo: true }
    });
    disciplines.forEach(d => console.log(`${d.id_disciplina} - ${d.codigo} - ${d.nome}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
