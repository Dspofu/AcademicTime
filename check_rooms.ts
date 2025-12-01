import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.sala.count({
        where: { ativa: true }
    });
    console.log(`Active Rooms Count: ${count}`);

    const allRooms = await prisma.sala.findMany();
    console.log('All Rooms:', allRooms);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
