//Servico de exportacao Excel — gera arquivo .xlsx com 4 abas.
const ExcelJS = require("exceljs");
const pool = require("../config/db");
const { getFromIPFS } = require("./ipfsService");

//Cores da identidade visual do projeto.
const HEADER_COLOR = "142562";
const HEADER_FONT_COLOR = "FFFFFF";
const SUBHEADER_COLOR = "2153CB";

//Definicao dos campos por aba: [chaveDB, labelExcel].
const AXOLOTE_FIELDS = [
  ["id", "ID"],
  ["cod_exemplar", "Código Exemplar"],
  ["nome_cientifico", "Nome Científico"],
  ["especie_apelido", "Espécie / Apelido"],
  ["data_nasc", "Data Nascimento"],
  ["marcas_distintivas", "Marcas Distintivas"],
  ["esta_vivo", "Está Vivo"],
  ["aquario_codigo", "Aquário (Código)"],
  ["operador_nome", "Operador"],
  ["imagem_url", "Imagem URL"],
  ["cid_ipfs", "CID IPFS"],
  ["onchain_entity_id", "ID On-Chain"],
  ["tx_hash", "TX Hash"],
];

const AQUARIO_FIELDS = [
  ["id", "ID"],
  ["codigo_tanque", "Código Tanque"],
  ["localizacao", "Localização"],
  ["volume_nominal", "Volume Nominal (L)"],
  ["volume_efetivo", "Volume Efetivo (L)"],
  ["altura_nominal", "Altura Nominal (cm)"],
  ["altura_efetiva", "Altura Efetiva (cm)"],
  ["largura", "Largura (cm)"],
  ["comprimento", "Comprimento (cm)"],
  ["tipo_tanque", "Tipo Tanque"],
  ["tipo_sistema", "Tipo Sistema"],
  ["tipo_sustrato", "Tipo Sustrato"],
  ["tipo_filtro", "Tipo Filtro"],
  ["tipo_aireador", "Tipo Aireador"],
  ["descricao_marca_modelo", "Descrição Marca/Modelo"],
  ["lista_especies", "Espécies"],
  ["quant_exemplares", "Qtd Exemplares"],
  ["operador_nome", "Operador"],
  ["imagem_url", "Imagem URL"],
  ["cid_ipfs", "CID IPFS"],
  ["onchain_entity_id", "ID On-Chain"],
  ["tx_hash", "TX Hash"],
];

const REG_AXOLOTE_DB_FIELDS = [
  ["id", "ID Registro"],
  ["axolote_cod", "Axolote (Código)"],
  ["operador_nome", "Operador"],
  ["status_auditoria", "Status"],
  ["data_registro", "Data Registro"],
  ["data_ultima_medicao", "Data Medição"],
  ["cid_ipfs", "CID IPFS"],
  ["tx_hash", "TX Hash"],
];

//Campos expandidos do IPFS para registros de axolote.
const REG_AXOLOTE_IPFS_FIELDS = [
  ["medical_weight", "Peso (g)"],
  ["medical_length", "Comprimento (cm)"],
  ["medical_reason", "Motivo Consulta"],
  ["medical_alarmSignals", "Sinais de Alarme"],
  ["medical_notes", "Notas Médicas"],
  ["feeding_date", "Data Alimentação"],
  ["feeding_croquetasAzoo", "Croquetas Azoo"],
  ["feeding_croquetasQualispiscis", "Croquetas Qualispiscis"],
  ["feeding_tilapiaSalmon", "Tilápia/Salmão"],
  ["feeding_tubifex", "Tubifex"],
  ["feeding_guppies", "Guppies"],
  ["feeding_earthworm", "Minhoca"],
  ["feeding_observations", "Obs. Alimentação"],
  ["behavior_generalActivity", "Atividade Geral"],
  ["behavior_courtship", "Cortejo"],
  ["behavior_socialInteraction", "Interação Social"],
  ["behavior_gillMovements", "Mov. Brânquias"],
  ["behavior_alarmSignals", "Sinais Alarme (Comp.)"],
  ["death_date", "Data Óbito"],
  ["death_cause", "Causa Óbito"],
  ["death_notes", "Notas Óbito"],
];

const REG_AQUARIO_DB_FIELDS = [
  ["id", "ID Registro"],
  ["aquario_cod", "Aquário (Código)"],
  ["operador_nome", "Operador"],
  ["status_auditoria", "Status"],
  ["data_registro", "Data Registro"],
  ["data_ultima_medicao", "Data Medição"],
  ["cid_ipfs", "CID IPFS"],
  ["tx_hash", "TX Hash"],
];

//Campos expandidos do IPFS para registros de aquario.
const REG_AQUARIO_IPFS_FIELDS = [
  ["temp_water", "Temp. Água (°C)"],
  ["temp_room", "Temp. Ambiente (°C)"],
  ["ph", "pH"],
  ["ammonia", "Amônia (mg/L)"],
  ["nitrite", "Nitrito (mg/L)"],
  ["nitrate", "Nitrato (mg/L)"],
  ["dissolvedOxygen", "Oxigênio Dissolvido (mg/L)"],
  ["hardness", "Dureza (mg/L)"],
  ["alkalinity", "Alcalinidade (mg/L)"],
  ["turbidity", "Turbidez"],
  ["conductivity", "Condutividade"],
  ["chlorine", "Cloro"],
  ["notes", "Notas"],
];

//Aplicando estilo no header de uma aba.
function styleHeader(worksheet, colCount) {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  for (let col = 1; col <= colCount; col++) {
    const cell = headerRow.getCell(col);
    cell.font = { name: "Calibri", bold: true, size: 11, color: { argb: HEADER_FONT_COLOR } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_COLOR } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: "D4D4D8" } } };
  }
}

//Ajustando largura das colunas automaticamente.
function autoWidth(worksheet, minWidth = 12, maxWidth = 40) {
  worksheet.columns.forEach((col) => {
    let max = minWidth;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 2, maxWidth);
  });
}

//Escrevendo dados numa aba.
function writeSheet(worksheet, fields, rows) {
  //Header.
  fields.forEach(([, label], i) => {
    worksheet.getCell(1, i + 1).value = label;
  });
  styleHeader(worksheet, fields.length);

  //Dados.
  rows.forEach((row, rowIdx) => {
    fields.forEach(([key], colIdx) => {
      const cell = worksheet.getCell(rowIdx + 2, colIdx + 1);
      let value = row[key];
      if (value instanceof Date) value = value.toISOString().split("T")[0];
      if (typeof value === "boolean") value = value ? "Sim" : "Não";
      cell.value = value ?? "";
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = { vertical: "middle" };
    });
  });

  autoWidth(worksheet);
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
}

//Expandindo dados do IPFS de um registro de axolote em colunas planas.
function flattenAxoloteIPFS(ipfsData) {
  const flat = {};
  const med = ipfsData?.medicalRecords?.[0] || {};
  flat.medical_weight = med.weight;
  flat.medical_length = med.length;
  flat.medical_reason = med.reason;
  flat.medical_alarmSignals = med.alarmSignals;
  flat.medical_notes = med.notes;

  const feed = ipfsData?.feedingRecords?.[0] || {};
  flat.feeding_date = feed.date;
  flat.feeding_croquetasAzoo = feed.food?.croquetasAzoo;
  flat.feeding_croquetasQualispiscis = feed.food?.croquetasQualispiscis;
  flat.feeding_tilapiaSalmon = feed.food?.tilapiaSalmon;
  flat.feeding_tubifex = feed.food?.tubifex;
  flat.feeding_guppies = feed.food?.guppies;
  flat.feeding_earthworm = feed.food?.earthworm;
  flat.feeding_observations = feed.observations;

  const beh = ipfsData?.behaviorRecords?.[0] || {};
  const interval = beh.intervals?.[0] || {};
  flat.behavior_generalActivity = interval.generalActivity;
  flat.behavior_courtship = interval.courtship;
  flat.behavior_socialInteraction = interval.socialInteraction;
  flat.behavior_gillMovements = beh.gillMovements;
  flat.behavior_alarmSignals = beh.alarmSignals;

  const death = ipfsData?.deathRecords?.[0] || {};
  flat.death_date = death.date;
  flat.death_cause = death.cause;
  flat.death_notes = death.notes;

  return flat;
}

//Expandindo dados do IPFS de um registro de aquario em colunas planas.
function flattenAquarioIPFS(ipfsData) {
  const flat = {};
  const meas = ipfsData?.waterQualityRecords?.[0] || {};
  const phys = meas.physicalConditions || {};
  const chem = meas.basicChemistry || {};
  const nutr = meas.nutrients || {};
  const gases = meas.dissolvedGases || {};
  const toxic = meas.toxicContaminants || {};
  const room = ipfsData?.roomConditionRecords?.[0] || {};

  flat.temp_water = phys.waterTemperature;
  flat.temp_room = room.roomTemperature;
  flat.ph = chem.ph;
  flat.ammonia = chem.ammonia;
  flat.nitrite = chem.nitrite;
  flat.nitrate = nutr.nitrate;
  flat.dissolvedOxygen = gases.dissolvedOxygen;
  flat.hardness = chem.hardness;
  flat.alkalinity = chem.alkalinity;
  flat.turbidity = phys.turbidity;
  flat.conductivity = phys.conductivity;
  flat.chlorine = toxic.chlorine;
  flat.notes = meas.notes;

  return flat;
}

//Gerando workbook completo com as 4 abas.
async function buildExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AxoloDAO";
  workbook.created = new Date();

  //Aba 1: Axolotes.
  const axolotesResult = await pool.query(`
    SELECT a.*, o."nome" AS operador_nome, q."codigo_tanque" AS aquario_codigo
    FROM "Axolote" a
    LEFT JOIN "Operador" o ON a."fk_operador_id" = o."id"
    LEFT JOIN "Aquario" q ON a."fk_aquario_id" = q."id"
    ORDER BY a."id"
  `);
  const wsAxolotes = workbook.addWorksheet("Axolotes");
  writeSheet(wsAxolotes, AXOLOTE_FIELDS, axolotesResult.rows);

  //Aba 2: Aquarios.
  const aquariosResult = await pool.query(`
    SELECT a.*, o."nome" AS operador_nome
    FROM "Aquario" a
    LEFT JOIN "Operador" o ON a."fk_operador_id" = o."id"
    ORDER BY a."id"
  `);
  const wsAquarios = workbook.addWorksheet("Aquários");
  writeSheet(wsAquarios, AQUARIO_FIELDS, aquariosResult.rows);

  //Aba 3: Registros de Axolote (com dados IPFS expandidos).
  const regAxoloteResult = await pool.query(`
    SELECT r.*, ax."cod_exemplar" AS axolote_cod, o."nome" AS operador_nome
    FROM "Registro_Axolote" r
    LEFT JOIN "Axolote" ax ON r."fk_axolote_id" = ax."id"
    LEFT JOIN "Operador" o ON r."fk_operador_id" = o."id"
    ORDER BY r."data_registro" DESC
  `);

  //Buscando dados IPFS em paralelo (rapido).
  const regAxoloteRows = await Promise.all(
    regAxoloteResult.rows.map(async (reg) => {
      let ipfsFlat = {};
      if (reg.cid_ipfs) {
        try {
          const ipfsData = await getFromIPFS(reg.cid_ipfs);
          ipfsFlat = flattenAxoloteIPFS(ipfsData);
        } catch (err) {
          console.error(`Erro ao buscar IPFS ${reg.cid_ipfs}:`, err.message);
        }
      }
      return { ...reg, ...ipfsFlat };
    })
  );

  const wsRegAxolote = workbook.addWorksheet("Registros Axolote");
  writeSheet(wsRegAxolote, [...REG_AXOLOTE_DB_FIELDS, ...REG_AXOLOTE_IPFS_FIELDS], regAxoloteRows);

  //Aba 4: Registros de Aquario (com dados IPFS expandidos).
  const regAquarioResult = await pool.query(`
    SELECT r.*, aq."codigo_tanque" AS aquario_cod, o."nome" AS operador_nome
    FROM "Registro_Aquario" r
    LEFT JOIN "Aquario" aq ON r."fk_aquario_id" = aq."id"
    LEFT JOIN "Operador" o ON r."fk_operador_id" = o."id"
    ORDER BY r."data_registro" DESC
  `);

  //Buscando dados IPFS em paralelo (rapido).
  const regAquarioRows = await Promise.all(
    regAquarioResult.rows.map(async (reg) => {
      let ipfsFlat = {};
      if (reg.cid_ipfs) {
        try {
          const ipfsData = await getFromIPFS(reg.cid_ipfs);
          ipfsFlat = flattenAquarioIPFS(ipfsData);
        } catch (err) {
          console.error(`Erro ao buscar IPFS ${reg.cid_ipfs}:`, err.message);
        }
      }
      return { ...reg, ...ipfsFlat };
    })
  );

  const wsRegAquario = workbook.addWorksheet("Registros Aquário");
  writeSheet(wsRegAquario, [...REG_AQUARIO_DB_FIELDS, ...REG_AQUARIO_IPFS_FIELDS], regAquarioRows);

  return workbook;
}

//Exportando as funcoes.
module.exports = { buildExcel };
