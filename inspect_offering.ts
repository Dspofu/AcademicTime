import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const offeringId = '0932e128-8b87-40be-9874-eb8470e03de5'; // ID from model_debug.json constraint
    console.log(`Inspecting Offering: ${offeringId}`);

    const offering = await prisma.ofertaDisciplina.findUnique({
        where: { id_oferta: offeringId },
        include: { professor: { include: { diasIndesejados: true } }, disciplina: true }
    });

    if (!offering) {
        console.error('Offering not found!');
        return;
    }

    console.log('Offering Details:', offering);
    console.log('Professor Undesired Days:', offering.professor.diasIndesejados);

    // Check Rooms for this offering
    const rooms = await prisma.sala.findMany({
        where: {
            ativa: true,
            tipo_recurso: offering.tipo_recurso_exigido,
            capacidade: { gte: offering.capacidade_minima }
        }
    });

    console.log(`Compatible Rooms Found: ${rooms.length}`);
    rooms.forEach(r => console.log(` - ${r.nome_codigo} (${r.tipo_recurso}, Cap: ${r.capacidade})`));

    if (rooms.length === 0) {
        console.error('CRITICAL: No compatible rooms found for this offering!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
