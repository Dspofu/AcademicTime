import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Dias da Semana
    const dias = [
        { id_dia: 'SEG', nome: 'Segunda-feira', ordem: 1 },
        { id_dia: 'TER', nome: 'Terça-feira', ordem: 2 },
        { id_dia: 'QUA', nome: 'Quarta-feira', ordem: 3 },
        { id_dia: 'QUI', nome: 'Quinta-feira', ordem: 4 },
        { id_dia: 'SEX', nome: 'Sexta-feira', ordem: 5 },
    ];

    for (const dia of dias) {
        await prisma.diaSemana.upsert({
            where: { id_dia: dia.id_dia },
            update: {},
            create: dia,
        });
    }

    // Slots (Exemplo: Manhã de 50min)
    const slots = [
        { id_slot: 1, horario_inicio: '07:00', horario_fim: '07:50', turno: 'MANHA' },
        { id_slot: 2, horario_inicio: '07:50', horario_fim: '08:40', turno: 'MANHA' },
        { id_slot: 3, horario_inicio: '08:50', horario_fim: '09:40', turno: 'MANHA' },
        { id_slot: 4, horario_inicio: '09:40', horario_fim: '10:30', turno: 'MANHA' },
        { id_slot: 5, horario_inicio: '10:40', horario_fim: '11:30', turno: 'MANHA' },
        { id_slot: 6, horario_inicio: '11:30', horario_fim: '12:20', turno: 'MANHA' },
    ];

    for (const slot of slots) {
        await prisma.slotHorario.upsert({
            where: { id_slot: slot.id_slot },
            update: {},
            create: slot,
        });
    }

    // Configuração Padrão
    await prisma.configuracaoRestricao.upsert({
        where: { id_config: 'CONFIG-PADRAO' },
        update: {},
        create: {
            id_config: 'CONFIG-PADRAO',
            peso_dia_indesejado: 10,
            ativo_regra_pie: true,
        },
    });

    console.log('Seed data inserted successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
