import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying database setup...');

    // Check DiaSemana
    const dias = await prisma.diaSemana.findMany();
    console.log(`DiaSemana count: ${dias.length}`);
    if (dias.length !== 5) throw new Error('Expected 5 days');

    // Check SlotHorario
    const slots = await prisma.slotHorario.findMany();
    console.log(`SlotHorario count: ${slots.length}`);
    if (slots.length !== 6) throw new Error('Expected 6 slots');

    // Check ConfiguracaoRestricao
    const config = await prisma.configuracaoRestricao.findUnique({
        where: { id_config: 'CONFIG-PADRAO' },
    });
    console.log('Config:', config);
    if (!config) throw new Error('Expected default config');

    console.log('Verification successful!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
