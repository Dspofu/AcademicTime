import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Lab Capacities to 40...');

    const result = await prisma.sala.updateMany({
        where: { tipo_recurso: 'LABORATORIO' },
        data: { capacidade: 40 }
    });

    console.log(`Updated ${result.count} laboratories.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
