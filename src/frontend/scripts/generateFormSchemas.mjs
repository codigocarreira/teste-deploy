import fs from "fs";
import path from "path";

const AXOLOTE_CSV = path.resolve("SistemaAxoloDAO-G4-Axolote.csv");

const AMBIENTE_CSV = path.resolve("SistemaAxoloDAO-G4-MedioAmbiente.csv");

const OUTPUT_DIR = path.resolve("src/data/generated");

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

function normalizeValue(value) {
  if (!value) return "";
  return String(value).trim();
}

function inferFieldType(parameter = "", indicator = "") {
  const text = `${parameter} ${indicator}`.toLowerCase();

  if (
    text.includes("sí/no") ||
    text.includes("si/no") ||
    text.includes("presencia") ||
    text.includes("ausencia")
  ) {
    return "boolean";
  }

  if (text.includes("fecha") || text.includes("date")) {
    return "date";
  }

  if (
    text.includes("categorías") ||
    text.includes("categorias") ||
    text.includes("escala") ||
    text.includes("tipo de")
  ) {
    return "text";
  }

  if (
    text.includes("mm") ||
    text.includes("cm") ||
    text.includes("kg") ||
    text.includes("g)") ||
    text.includes("mg/l") ||
    text.includes("ppm") ||
    text.includes("°c") ||
    text.includes("ph") ||
    text.includes("%") ||
    text.includes("conteo") ||
    text.includes("rgb") ||
    text.includes("l/h") ||
    text.includes("µs/cm")
  ) {
    return "number";
  }

  if (
    text.includes("foto") ||
    text.includes("imagen") ||
    text.includes(".jpg") ||
    text.includes(".png") ||
    text.includes("archivo")
  ) {
    return "file";
  }

  if (
    text.includes("descripción") ||
    text.includes("descripcion") ||
    text.includes("bitacora") ||
    text.includes("observ")
  ) {
    return "textarea";
  }

  return "text";
}

function inferPlaceholder(parameter = "", indicator = "") {
  const cleanIndicator = normalizeValue(indicator);
  const cleanParameter = normalizeValue(parameter);

  if (cleanParameter) return cleanParameter;
  if (cleanIndicator) return `Preencha: ${cleanIndicator}`;
  return "Preencha o campo";
}

function buildSchema(rows, kind) {
  let currentVariable = "";
  let currentDimension = "";
  let currentSubdimension = "";

  const grouped = [];

  const getOrCreateVariable = (name) => {
    let variable = grouped.find((item) => item.name === name);
    if (!variable) {
      variable = {
        id: slugify(name),
        name,
        dimensions: [],
      };
      grouped.push(variable);
    }
    return variable;
  };

  const getOrCreateDimension = (variable, name) => {
    let dimension = variable.dimensions.find((item) => item.name === name);
    if (!dimension) {
      dimension = {
        id: slugify(`${variable.name}-${name}`),
        name,
        subdimensions: [],
      };
      variable.dimensions.push(dimension);
    }
    return dimension;
  };

  const getOrCreateSubdimension = (dimension, name) => {
    let subdimension = dimension.subdimensions.find(
      (item) => item.name === name,
    );

    if (!subdimension) {
      subdimension = {
        id: slugify(`${dimension.name}-${name}`),
        name,
        fields: [],
      };
      dimension.subdimensions.push(subdimension);
    }
    return subdimension;
  };

  rows.forEach((row) => {
    const variable = normalizeValue(row["VARIABLE"]);
    const dimension = normalizeValue(row["DIMENSIÓN"]);
    const subdimension = normalizeValue(row["SUBDIMENSIÓN"]);
    const indicator = normalizeValue(row["INDICADOR"]);
    const parameter = normalizeValue(row["PARÁMETRO/UNIDAD"]);

    if (variable) currentVariable = variable;
    if (dimension) currentDimension = dimension;
    if (subdimension) currentSubdimension = subdimension;

    if (!indicator || !currentVariable || !currentDimension) return;

    const variableNode = getOrCreateVariable(currentVariable);
    const dimensionNode = getOrCreateDimension(variableNode, currentDimension);
    const subdimensionNode = getOrCreateSubdimension(
      dimensionNode,
      currentSubdimension || "Geral",
    );

    subdimensionNode.fields.push({
      id: slugify(`${kind}-${indicator}`),
      label: indicator,
      parameter,
      type: inferFieldType(parameter, indicator),
      placeholder: inferPlaceholder(parameter, indicator),
    });
  });

  return grouped;
}

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function writeSchema(fileName, schema) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, fileName),
    JSON.stringify(schema, null, 2),
    "utf-8",
  );
}

function main() {
  ensureOutputDir();

  const axoloteRows = readCsv(AXOLOTE_CSV);
  const ambienteRows = readCsv(AMBIENTE_CSV);

  const axoloteSchema = buildSchema(axoloteRows, "axolote");
  const ambienteSchema = buildSchema(ambienteRows, "ambiente");

  writeSchema("axoloteSchema.json", axoloteSchema);
  writeSchema("ambienteSchema.json", ambienteSchema);

  console.log("Schemas gerados com sucesso.");
}

main();
