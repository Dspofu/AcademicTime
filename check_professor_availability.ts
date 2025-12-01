import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- PROFESSOR AVAILABILITY CHECK ---');

    const professors = await prisma.professor.findMany({
        include: {
            diasIndesejados: true,
            ofertas: true
        }
    });

    for (const p of professors) {
        console.log(`\nProfessor: ${p.nome} (${p.id_professor})`);
        console.log(`  Undesired Days: ${p.diasIndesejados.map(d => d.id_dia).join(', ')}`);

        const totalClasses = p.ofertas.reduce((sum, o) => sum + o.aulas_semanais_exigidas, 0);
        console.log(`  Total Classes Assigned: ${totalClasses}`);

        // Check if blocked on all days
        const allDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
        const blockedDays = p.diasIndesejados.map(d => d.id_dia);
        const availableDays = allDays.filter(d => !blockedDays.includes(d));

        console.log(`  Available Days: ${availableDays.join(', ')}`);
        console.log(`  Available Slots (approx 4/day): ${availableDays.length * 4}`);

        if (totalClasses > availableDays.length * 4) {
            console.error(`  CRITICAL: Professor needs ${totalClasses} slots but only has approx ${availableDays.length * 4} available.`);
        }

        // Check PIE conflict
        const pieOfferings = p.ofertas.filter(o => o.is_pie);
        if (pieOfferings.length > 0) {
            console.log(`  Has PIE Offerings: Yes (${pieOfferings.length})`);
            const pieDays = ['SEG', 'QUI'];
            const availablePieDays = pieDays.filter(d => !blockedDays.includes(d));
            if (availablePieDays.length === 0) {
                console.error(`  CRITICAL: Professor has PIE offerings but is blocked on both SEG and QUI.`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
