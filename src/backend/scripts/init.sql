DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'status_auditoria_enum'
    ) THEN
        CREATE TYPE status_auditoria_enum AS ENUM (
            'PENDENTE',
            'APROVADO',
            'REPROVADO'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS "Instituicoes" (
    "id" SERIAL PRIMARY KEY,
    "nome" TEXT,
    "dominio" TEXT UNIQUE,
    "blockchain_id" INTEGER
);

CREATE TABLE IF NOT EXISTS "Administrador" (
    "id" SERIAL PRIMARY KEY,
    "nome" VARCHAR NOT NULL,
    "carteira_metamask" VARCHAR NOT NULL UNIQUE,
    "fk_instituicao_id" INT,
    "ens" TEXT,
    "tx_hash" TEXT,
    CONSTRAINT fk_admin_instituicao
        FOREIGN KEY ("fk_instituicao_id")
        REFERENCES "Instituicoes"("id")
);

CREATE TABLE IF NOT EXISTS "Operador" (
    "id" SERIAL PRIMARY KEY,
    "nome" VARCHAR NOT NULL,
    "carteira_metamask" VARCHAR NOT NULL UNIQUE,
    "fk_administrador_id" INT,
    "dominio" TEXT,
    "fk_instituicao_id" INT,
    "status" TEXT DEFAULT 'PENDING',
    "ativo" BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_operador_admin
        FOREIGN KEY ("fk_administrador_id")
        REFERENCES "Administrador"("id"),

    CONSTRAINT fk_operador_instituicao
        FOREIGN KEY ("fk_instituicao_id")
        REFERENCES "Instituicoes"("id")
);

CREATE TABLE IF NOT EXISTS "Auditor" (
    "id" SERIAL PRIMARY KEY,
    "nome" VARCHAR NOT NULL,
    "carteira_metamask" VARCHAR NOT NULL UNIQUE,
    "fk_administrador_id" INT,
    "dominio" TEXT,
    "fk_instituicao_id" INT,
    "status" TEXT DEFAULT 'PENDING',
    "ativo" BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_auditor_admin
        FOREIGN KEY ("fk_administrador_id")
        REFERENCES "Administrador"("id"),

    CONSTRAINT fk_auditor_instituicao
        FOREIGN KEY ("fk_instituicao_id")
        REFERENCES "Instituicoes"("id")
);

CREATE TABLE IF NOT EXISTS "Aquario" (
    "id" SERIAL PRIMARY KEY,
    "fk_operador_id" INT NOT NULL,

    "codigo_tanque" VARCHAR NOT NULL UNIQUE,
    "localizacao" VARCHAR NOT NULL,

    "volume_nominal" NUMERIC NOT NULL,
    "volume_efetivo" NUMERIC NOT NULL,

    "altura_nominal" NUMERIC NOT NULL,
    "altura_efetiva" NUMERIC NOT NULL,

    "largura" NUMERIC NOT NULL,
    "comprimento" NUMERIC NOT NULL,

    "tipo_tanque" VARCHAR NOT NULL,
    "tipo_sistema" VARCHAR NOT NULL,
    "tipo_sustrato" VARCHAR NOT NULL,
    "tipo_filtro" VARCHAR NOT NULL,
    "tipo_aireador" VARCHAR NOT NULL,

    "descricao_marca_modelo" TEXT NOT NULL,
    "lista_especies" TEXT NOT NULL,
    "quant_exemplares" INT NOT NULL,

    "imagem_url" TEXT,
    "cid_ipfs" VARCHAR,
    "onchain_entity_id" INT,
    "tx_hash" VARCHAR,

    "fk_instituicao_id" INT,

    CONSTRAINT fk_aquario_operador
        FOREIGN KEY ("fk_operador_id")
        REFERENCES "Operador"("id"),

    CONSTRAINT fk_aquario_instituicao
        FOREIGN KEY ("fk_instituicao_id")
        REFERENCES "Instituicoes"("id")
);

CREATE TABLE IF NOT EXISTS "Axolote" (
    "id" SERIAL PRIMARY KEY,

    "nome_cientifico" VARCHAR NOT NULL,
    "especie_apelido" VARCHAR NOT NULL,
    "cod_exemplar" VARCHAR NOT NULL UNIQUE,

    "data_nasc" DATE NOT NULL,
    "marcas_distintivas" TEXT NOT NULL,

    "esta_vivo" BOOLEAN NOT NULL DEFAULT TRUE,

    "fk_aquario_id" INT NOT NULL,
    "fk_operador_id" INT NOT NULL,

    "imagem_url" TEXT,
    "cid_ipfs" VARCHAR,
    "onchain_entity_id" INT,
    "tx_hash" VARCHAR,

    "cor" TEXT,
    "sexo" TEXT,

    "fk_instituicao_id" INT,

    CONSTRAINT fk_axolote_aquario
        FOREIGN KEY ("fk_aquario_id")
        REFERENCES "Aquario"("id"),

    CONSTRAINT fk_axolote_operador
        FOREIGN KEY ("fk_operador_id")
        REFERENCES "Operador"("id"),

    CONSTRAINT fk_axolote_instituicao
        FOREIGN KEY ("fk_instituicao_id")
        REFERENCES "Instituicoes"("id")
);

CREATE TABLE IF NOT EXISTS "Registro_Aquario" (
    "id" SERIAL PRIMARY KEY,

    "fk_aquario_id" INT NOT NULL,
    "fk_operador_id" INT NOT NULL,
    "fk_auditor_id" INT,

    "status_auditoria" status_auditoria_enum NOT NULL DEFAULT 'PENDENTE',

    "cid_ipfs" VARCHAR NOT NULL,
    "cid_ipfs_auditoria" VARCHAR,

    "data_registro" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "data_ultima_alteracao" TIMESTAMP NOT NULL,
    "data_ultima_medicao" DATE NOT NULL,

    "tx_hash" VARCHAR,
    "onchain_entity_id" INT,
    "onchain_record_id" INT,

    CONSTRAINT fk_reg_aquario_aquario
        FOREIGN KEY ("fk_aquario_id")
        REFERENCES "Aquario"("id"),

    CONSTRAINT fk_reg_aquario_operador
        FOREIGN KEY ("fk_operador_id")
        REFERENCES "Operador"("id"),

    CONSTRAINT fk_reg_aquario_auditor
        FOREIGN KEY ("fk_auditor_id")
        REFERENCES "Auditor"("id")
);

CREATE TABLE IF NOT EXISTS "Registro_Axolote" (
    "id" SERIAL PRIMARY KEY,

    "fk_axolote_id" INT NOT NULL,
    "fk_operador_id" INT NOT NULL,
    "fk_auditor_id" INT,

    "status_auditoria" status_auditoria_enum NOT NULL DEFAULT 'PENDENTE',

    "cid_ipfs" VARCHAR NOT NULL,
    "cid_ipfs_auditoria" VARCHAR,

    "data_registro" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "data_ultima_alteracao" TIMESTAMP NOT NULL,
    "data_ultima_medicao" DATE NOT NULL,

    "tx_hash" VARCHAR,
    "onchain_entity_id" INT,
    "onchain_record_id" INT,

    "peso" NUMERIC,
    "tamanho" NUMERIC,
    "data_medicao" TIMESTAMP DEFAULT now(),

    CONSTRAINT fk_reg_axolote_axolote
        FOREIGN KEY ("fk_axolote_id")
        REFERENCES "Axolote"("id"),

    CONSTRAINT fk_reg_axolote_operador
        FOREIGN KEY ("fk_operador_id")
        REFERENCES "Operador"("id"),

    CONSTRAINT fk_reg_axolote_auditor
        FOREIGN KEY ("fk_auditor_id")
        REFERENCES "Auditor"("id")
);

CREATE TABLE IF NOT EXISTS "solicitacao" (
    "id" SERIAL PRIMARY KEY,
    "nome_usuario" VARCHAR NOT NULL,
    "carteira_metamask" VARCHAR NOT NULL,
    "ens" TEXT,
    "role_desejada" VARCHAR NOT NULL,
    "fk_instituicao_id" INT NOT NULL,
    "blockchain_institution_id" INT NOT NULL,
    "status" VARCHAR DEFAULT 'PENDING',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "viewed" BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_solicitacao_instituicao
        FOREIGN KEY ("fk_instituicao_id")
        REFERENCES "Instituicoes"("id")
);