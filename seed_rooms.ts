import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Rooms...');

    const rooms = [
        { nome_codigo: 'Sala 101', capacidade: 40, tipo_recurso: 'SALA_COMUM', ativa: true },
        { nome_codigo: 'Sala 102', capacidade: 40, tipo_recurso: 'SALA_COMUM', ativa: true },
        { nome_codigo: 'Sala 103', capacidade: 40, tipo_recurso: 'SALA_COMUM', ativa: true },
        { nome_codigo: 'Lab Informática 1', capacidade: 30, tipo_recurso: 'LABORATORIO', ativa: true },
        { nome_codigo: 'Lab Informática 2', capacidade: 30, tipo_recurso: 'LABORATORIO', ativa: true },
        { nome_codigo: 'Auditório A', capacidade: 100, tipo_recurso: 'AUDITORIO', ativa: true },
    ];

    for (const room of rooms) {
        await prisma.sala.create({
            data: room
        });
    }

    console.log(`Created ${rooms.length} rooms.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
