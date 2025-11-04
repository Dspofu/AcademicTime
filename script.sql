CREATE TABLE turno (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL CHECK (categoria IN ('manha', 'tarde', 'noite')),
);

CREATE TABLE modalidade (
  id INTEGER PRIMARY KEY,
	nome TEXT NOT NULL CHECK (categoria IN ('ensino medio', 'faculdade')));

CREATE TABLE tipo_geminada (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL CHECK (categoria IN ('nunhuma', 'g2', 'g3', 'g22'))
);

CREATE TABLE dias_semana (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL CHECK (categoria IN ('nunhuma', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado'))
);


CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	email TEXT UNIQUE
)
 
CREATE TABLE IF NOT EXISTS professor (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	email TEXT UNIQUE,
	is_substituto INTEGER NOT NULL
)

--Juntado com agenda em disciplinas
/*CREATE TABLE IF NOT EXISTS turmas (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	id_turno INTEGER NOT NULL,
	id_modalidade INTEGER NOT NULL,
	FOREIGN KEY (id_turno) references turno(id),
	FOREIGN KEY (id_modalidade) references modalidade(id)
)*/

CREATE TABLE IF NOT EXISTS materias (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	is_exatas INTEGER NOT NULL
)

CREATE TABLE IF NOT EXISTS disciplinas(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_materia INTEGER NOT NULL,
	id_professor INTEGER NOT NULL,

	nome_turma VARCHAR(3) NOT NULL,
	auals_semanais_exigidas INTEGER NOT NULL,
	id_tipo_geminada INTEGER NOT NULL,
	tipo_recurso_exigido INTEGER,

	FOREIGN KEY (id_tipo_geminada) references tipo_geminada(id),
	FOREIGN KEY (tipo_recurso_exigido) references sala(id)
);

--Juntado com turmas em disciplinas
/*CREATE TABLE IF NOT EXISTS agenda (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_professor INTEGER NOT NULL,
	id_turma INTEGER NOT NULL,
	id_materia INTEGER NOT NULL,
	auals_semanais_exigidas INTEGER NOT NULL,
	id_tipo_geminada INTEGER NOT NULL,
	FOREIGN KEY (id_professor) references professor(id),
	FOREIGN KEY (id_turma) references turma(id),
	FOREIGN KEY (id_materia) references materia(id),
	FOREIGN KEY (id_tipo_geminada) references tipo_geminada(id)
)*/

CREATE TABLE IF NOT EXISTS preferencias (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_professor INTEGER NOT NULL,
	pref_evitar_ultimo_horario_manha INTEGER NOT NULL,
	pref_evitar_primeiro_horario_tarde INTEGER NOT NULL,
	pref_evitar_primeiros_horarios_dia INTEGER NOT NULL,
	pref_dia_livre_desejado INTEGER NOT NULL,
	pref_dia_planejamento_substituto INTEGER NOT NULL,
	FOREIGN KEY (id_professor) references professor(id),
	FOREIGN KEY (pref_dia_livre_desejado) references dias_semana(id),
	FOREIGN KEY (pref_dia_planejamento_substituto) references dias_semana(id),
)

CREATE TABLE IF NOT EXISTS restricoes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	--CP
	custo_CP1_multiplas_nao_geminadas INTEGER NOT NULL,
	custo_CP2_dias_seguidos INTEGER NOT NULL,
	custo_CP3_exatas_ultimos_horarios INTEGER NOT NULL,
	custo_CP4_turnos_distantes INTEGER NOT NULL,
	--PD
	custo_PD1_descanso_interjornada INTEGER NOT NULL,
	custo_PD2_intervalo_almoco INTEGER NOT NULL,
	custo_PD3_primeiros_horarios INTEGER NOT NULL,
	custo_PD4_dia_livre INTEGER NOT NULL,
	custo_PD5_dia_planejamento INTEGER NOT NULL,
)

CREATE TABLE IF NOT EXISTS slot_horario (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	is_primeiro_do_dia INTEGER NOT NULL,
	is_ultimo_do_dia INTEGER NOT NULL,
	is_ultimo_manha INTEGER NOT NULL,
	is_primeiro_tarde INTEGER NOT NULL,
	is_ultimos_dois_do_turno INTEGER NOT NULL
)

CREATE TABLE IF NOT EXISTS alocacao (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	id_agenda INTEGER NOT NULL,
	id_dia_semana INTEGER NOT NULL,
	id_slot_horario INTEGER NOT NULL,
	FOREIGN KEY (id_agenda) references agenda(id),
	FOREIGN KEY (id_dia_semana) references dias_semana(id),
	FOREIGN KEY (id_slot_horario) references slot_horario(id),
)

--Adicionado para limitação de recursos compartilhados pela faculdade
CREATE TABLE IF NOT EXISTS sala {
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_ou_codigo VARCHAR(50) NOT NULL, -- "Auditório A", "Lab B205"
  capacidade INTEGER, -- 80
  id_tipo INTEGER NOT NULL,
  FOREIGN KEY (id_tipo) references tipo_sala(id),
}

CREATE TABLE IF NOT EXISTS tipo_sala {
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL CHECK (nome IN ('comum', 'laboratorio','auditorio','computacao'));
}