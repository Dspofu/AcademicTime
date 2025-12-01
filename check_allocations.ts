import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.alocacao.count();
    console.log(`Total Allocations in DB: ${count}`);

    if (count > 0) {
        const sample = await prisma.alocacao.findMany({ take: 3 });
        console.log('Sample Allocations:', sample);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
