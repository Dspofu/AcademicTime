-- CreateTable
CREATE TABLE "dia_semana" (
    "id_dia" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "slot_horario" (
    "id_slot" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horario_inicio" TEXT,
    "horario_fim" TEXT,
    "turno" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "sala" (
    "id_sala" TEXT NOT NULL PRIMARY KEY,
    "nome_codigo" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "tipo_recurso" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "disciplina" (
    "id_disciplina" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "carga_horaria_semestral" INTEGER,
    "aulas_por_semana_padrao" INTEGER DEFAULT 4
);

-- CreateTable
CREATE TABLE "professor" (
    "id_professor" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "carga_horaria_meta" INTEGER NOT NULL,
    "is_substituto" BOOLEAN NOT NULL DEFAULT false,
    "prefere_aulas_geminadas" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "professor_dia_indesejado" (
    "id_professor" TEXT NOT NULL,
    "id_dia" TEXT NOT NULL,

    PRIMARY KEY ("id_professor", "id_dia"),
    CONSTRAINT "professor_dia_indesejado_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "professor" ("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "professor_dia_indesejado_id_dia_fkey" FOREIGN KEY ("id_dia") REFERENCES "dia_semana" ("id_dia") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "professor_modalidade_pref" (
    "id_professor" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,

    PRIMARY KEY ("id_professor", "modalidade"),
    CONSTRAINT "professor_modalidade_pref_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "professor" ("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_professor_vinculado" TEXT,
    CONSTRAINT "usuario_id_professor_vinculado_fkey" FOREIGN KEY ("id_professor_vinculado") REFERENCES "professor" ("id_professor") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "oferta_disciplina" (
    "id_oferta" TEXT NOT NULL PRIMARY KEY,
    "id_disciplina" TEXT NOT NULL,
    "id_professor" TEXT NOT NULL,
    "turma_sufixo" TEXT NOT NULL,
    "aulas_semanais_exigidas" INTEGER NOT NULL,
    "is_pie" BOOLEAN NOT NULL DEFAULT false,
    "tipo_recurso_exigido" TEXT NOT NULL,
    "capacidade_minima" INTEGER NOT NULL,
    "permite_geminada" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "oferta_disciplina_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "disciplina" ("id_disciplina") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "oferta_disciplina_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "professor" ("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracao_restricao" (
    "id_config" TEXT NOT NULL PRIMARY KEY,
    "peso_dia_indesejado" INTEGER DEFAULT 10,
    "peso_modalidade_indesejada" INTEGER DEFAULT 5,
    "peso_preferencia_geminada" INTEGER DEFAULT 2,
    "peso_evitar_janelas" INTEGER DEFAULT 20,
    "ativo_regra_pie" BOOLEAN DEFAULT true,
    "ativo_limite_3_aulas_dia" BOOLEAN DEFAULT true,
    "tempo_maximo_execucao_seg" INTEGER DEFAULT 300
);

-- CreateTable
CREATE TABLE "alocacao" (
    "id_alocacao" TEXT NOT NULL PRIMARY KEY,
    "id_oferta" TEXT NOT NULL,
    "id_dia" TEXT NOT NULL,
    "id_slot" INTEGER NOT NULL,
    "id_sala" TEXT NOT NULL,
    "data_geracao" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alocacao_id_oferta_fkey" FOREIGN KEY ("id_oferta") REFERENCES "oferta_disciplina" ("id_oferta") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alocacao_id_dia_fkey" FOREIGN KEY ("id_dia") REFERENCES "dia_semana" ("id_dia") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alocacao_id_slot_fkey" FOREIGN KEY ("id_slot") REFERENCES "slot_horario" ("id_slot") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alocacao_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "sala" ("id_sala") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "disciplina_codigo_key" ON "disciplina"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "alocacao_id_sala_id_dia_id_slot_key" ON "alocacao"("id_sala", "id_dia", "id_slot");

-- CreateIndex
CREATE UNIQUE INDEX "alocacao_id_oferta_id_dia_id_slot_key" ON "alocacao"("id_oferta", "id_dia", "id_slot");
