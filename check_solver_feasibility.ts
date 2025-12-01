import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SOLVER FEASIBILITY CHECK ---');

    // 1. Fetch Offerings (Demand)
    const offerings = await prisma.ofertaDisciplina.findMany();
    const totalDemand = offerings.reduce((sum, o) => sum + o.aulas_semanais_exigidas, 0);

    console.log(`\nDEMAND:`);
    console.log(`Total Offerings: ${offerings.length}`);
    console.log(`Total Slots Needed: ${totalDemand}`);

    // Breakdown by Resource Type
    const demandByResource: Record<string, number> = {};
    offerings.forEach(o => {
        demandByResource[o.tipo_recurso_exigido] = (demandByResource[o.tipo_recurso_exigido] || 0) + o.aulas_semanais_exigidas;
    });
    console.log('Demand by Resource Type:', demandByResource);

    // 2. Fetch Rooms (Supply)
    const rooms = await prisma.sala.findMany({ where: { ativa: true } });
    const slotsPerWeek = 5 * 4; // 5 days * 4 slots
    const totalSupply = rooms.length * slotsPerWeek;

    console.log(`\nSUPPLY:`);
    console.log(`Active Rooms: ${rooms.length}`);
    console.log(`Slots Per Room/Week: ${slotsPerWeek}`);
    console.log(`Total Slots Available: ${totalSupply}`);

    // Breakdown by Resource Type
    const supplyByResource: Record<string, number> = {};
    rooms.forEach(r => {
        supplyByResource[r.tipo_recurso] = (supplyByResource[r.tipo_recurso] || 0) + slotsPerWeek;
    });
    console.log('Supply by Resource Type:', supplyByResource);

    // 3. Analysis
    console.log(`\nANALYSIS:`);
    if (totalDemand > totalSupply) {
        console.error(`CRITICAL: Demand (${totalDemand}) exceeds Supply (${totalSupply}). Impossible to solve.`);
    } else {
        console.log(`Overall capacity is sufficient (${totalDemand} <= ${totalSupply}).`);
    }

    // Check specific resources
    Object.keys(demandByResource).forEach(type => {
        const demand = demandByResource[type];
        const supply = supplyByResource[type] || 0;
        if (demand > supply) {
            console.error(`CRITICAL RESOURCE SHORTAGE: ${type} needs ${demand} slots but only has ${supply}.`);
        } else {
            console.log(`Resource ${type}: OK (${demand} <= ${supply})`);
        }
    });

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
