import solver from 'javascript-lp-solver';

// --- INTERFACES (As mesmas de antes) ---
export interface ConfiguracaoRestricao {
    peso_dia_indesejado: number;
    peso_modalidade_indesejada: number;
    ativo_regra_pie: boolean;
    ativo_limite_3_aulas_dia: boolean;
}

export interface Professor {
    id_professor: string;
    dias_indesejados: string[];
    modalidades_preferidas: string[];
}

export interface Sala {
    id_sala: string;
    capacidade: number;
    tipo_recurso: 'COMUM' | 'LABORATORIO' | 'AUDITORIO';
}

export interface OfertaDisciplina {
    id_oferta: string;
    id_professor: string;
    aulas_semanais_exigidas: number;
    is_pie: boolean;
    tipo_recurso_exigido: 'COMUM' | 'LABORATORIO' | 'AUDITORIO';
    capacidade_minima: number;
    modalidade_curso: string;
}

export interface DiaSemana { id_dia: string; }
export interface SlotHorario { id_slot: number; }

export interface ResultadoAlocacao {
    id_oferta: string;
    id_professor: string;
    id_dia: string;
    id_slot: number;
    id_sala: string;
}

export class GradeSolverService {

    // Método auxiliar para gerar chaves
    private getKey(t: string, d: string, h: number, r: string): string {
        return `t${t}|d${d}|h${h}|r${r}`; // Usando pipe | para facilitar o split depois
    }

    public resolverGrade(
        ofertas: OfertaDisciplina[],
        professores: Professor[],
        salas: Sala[],
        dias: DiaSemana[],
        slots: SlotHorario[],
        config: ConfiguracaoRestricao
    ): ResultadoAlocacao[] {

        console.log('[SolverJS] Iniciando construção do modelo...');

        // 1. Estrutura base do Modelo
        const model = {
            optimize: "custo",
            opType: "min" as const, // Minimizar custos (soft constraints)
            constraints: {} as any,
            variables: {} as any,
            ints: {} as any // Lista de variáveis que devem ser inteiras (0 ou 1)
        };

        // Indexação rápida
        const mapProfessores = new Map(professores.map(p => [p.id_professor, p]));

        // =====================================================================
        // PASSO A: DEFINIR OS LIMITES DAS RESTRIÇÕES (CONSTRAINTS)
        // Aqui definimos o "Lado Direito" das equações (RHS)
        // =====================================================================

        // H1. Carga Horária: Cada oferta deve ter EXATAMENTE X aulas
        ofertas.forEach(t => {
            model.constraints[`carga_${t.id_oferta}`] = { equal: t.aulas_semanais_exigidas };
        });

        // H2. Conflito Professor: Max 1 por (Dia + Slot + Professor)
        professores.forEach(p => {
            dias.forEach(d => {
                slots.forEach(h => {
                    model.constraints[`prof_${p.id_professor}_${d.id_dia}_${h.id_slot}`] = { max: 1 };
                });
            });
        });

        // H3. Conflito Sala: Max 1 por (Dia + Slot + Sala)
        salas.forEach(r => {
            dias.forEach(d => {
                slots.forEach(h => {
                    model.constraints[`sala_${r.id_sala}_${d.id_dia}_${h.id_slot}`] = { max: 1 };
                });
            });
        });

        // H4. Limite 3 aulas/dia (Opcional)
        if (config.ativo_limite_3_aulas_dia) {
            ofertas.forEach(t => {
                dias.forEach(d => {
                    model.constraints[`max3_${t.id_oferta}_${d.id_dia}`] = { max: 3 };
                });
            });
        }

        // Regra PIE (Hard):
        // Não precisamos criar constraints aqui. Simplesmente NÃO criaremos as variáveis
        // para os dias proibidos no passo B. É mais eficiente.

        // =====================================================================
        // PASSO B: CRIAR AS VARIÁVEIS DE DECISÃO
        // Cada variável representa uma possível alocação: "Aula T no Dia D, Hora H, Sala R"
        // =====================================================================

        const diasPie = ['SEG', 'QUI'];

        ofertas.forEach(t => {
            const prof = mapProfessores.get(t.id_professor);
            if (!prof) return;

            dias.forEach(d => {

                // FILTRO HARD: Regra PIE
                if (config.ativo_regra_pie && t.is_pie && !diasPie.includes(d.id_dia)) {
                    return; // Pula este dia, não cria variável (impossível alocar)
                }

                slots.forEach(h => {
                    salas.forEach(r => {

                        // FILTRO HARD: Capacidade e Tipo de Sala
                        if (r.capacidade < t.capacidade_minima || r.tipo_recurso !== t.tipo_recurso_exigido) {
                            return; // Sala incompatível, pula.
                        }

                        // --- CÁLCULO DE CUSTO (SOFT CONSTRAINTS) PARA ESTA POSSIBILIDADE ---
                        let custoAlocacao = 0;

                        // S1. Dia Indesejado
                        if (prof.dias_indesejados.includes(d.id_dia)) {
                            custoAlocacao += config.peso_dia_indesejado;
                        }

                        // S2. Modalidade Indesejada
                        if (!prof.modalidades_preferidas.includes(t.modalidade_curso)) {
                            custoAlocacao += config.peso_modalidade_indesejada;
                        }

                        // Se quiser evitar custos zero para o solver não se perder, põe um custo base mínimo
                        // custoAlocacao += 1; 

                        // --- CRIAÇÃO DA VARIÁVEL ---
                        const varName = this.getKey(t.id_oferta, d.id_dia, h.id_slot, r.id_sala);

                        // O objeto abaixo diz: "Se esta variável for escolhida (valor 1)..."
                        model.variables[varName] = {
                            // ... ela soma 1 no custo total
                            custo: custoAlocacao,

                            // ... ela consome 1 crédito da carga horária desta oferta
                            [`carga_${t.id_oferta}`]: 1,

                            // ... ela ocupa este professor neste horário
                            [`prof_${prof.id_professor}_${d.id_dia}_${h.id_slot}`]: 1,

                            // ... ela ocupa esta sala neste horário
                            [`sala_${r.id_sala}_${d.id_dia}_${h.id_slot}`]: 1
                        };

                        // Adiciona restrição H4 (Max 3) se ativa
                        if (config.ativo_limite_3_aulas_dia) {
                            model.variables[varName][`max3_${t.id_oferta}_${d.id_dia}`] = 1;
                        }

                        // Marca que esta variável é inteira (binária, na verdade)
                        // No lp-solver, variáveis são > 0 por padrão. 
                        // Para ser 0 ou 1, dizemos que é int. O solver tentará 1.
                        model.ints[varName] = 1;

                    });
                });
            });
        });

        console.log(`[SolverJS] Modelo montado. ${Object.keys(model.variables).length} variáveis geradas.`);

        // =====================================================================
        // PASSO C: RESOLVER
        // =====================================================================

        // Executa a solução
        const results = solver.Solve(model);

        console.log('[SolverJS] Status:', results.feasible ? 'Viável' : 'Inviável');
        console.log('[SolverJS] Detalhes:', results);

        if (!results.feasible) {
            throw new Error("Não foi possível gerar a grade. Verifique se há salas suficientes ou reduza as restrições.");
        }

        // =====================================================================
        // PASSO D: PARSE DO RESULTADO
        // =====================================================================

        const gradeFinal: ResultadoAlocacao[] = [];

        // O objeto 'results' contém chaves com as variáveis que foram escolhidas (valor > 0)
        Object.keys(results).forEach(key => {
            // Ignora chaves de metadados do solver (result, feasible, bounded)
            if (key === 'feasible' || key === 'result' || key === 'bounded') return;

            // Valida se a chave segue o padrão esperado (t<id>|d<id>|h<num>|r<id>)
            if (!key.includes('|')) return; // Ignora chaves que não são variáveis

            // Se o valor for próximo de 1 (alocado)
            if (results[key] > 0.5) {
                const parts = key.split('|');
                if (parts.length !== 4) return; // Valida estrutura

                const [t, d, h, r] = parts.map(s => s.substring(1)); // Remove o prefixo t, d, h, r

                // Valida se os valores foram extraídos corretamente
                if (!t || !d || !h || !r) return;

                // Busca o ID do professor (opcional, só para o retorno)
                const profId = ofertas.find(o => o.id_oferta === t)?.id_professor || '';

                gradeFinal.push({
                    id_oferta: t,
                    id_professor: profId,
                    id_dia: d,
                    id_slot: parseInt(h),
                    id_sala: r
                });
            }
        });

        return gradeFinal;
    }
}
