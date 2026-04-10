import { getFriendlyLabel } from "./schemaLabels";

export function resolveRef(ref, rootSchema) {
  if (!ref || !ref.startsWith("#/")) return null;

  const path = ref.replace(/^#\//, "").split("/");
  let current = rootSchema;

  for (const segment of path) {
    if (!current) return null;
    current = current[segment];
  }

  return current || null;
}

export function normalizeSchemaField(fieldSchema, rootSchema) {
  if (!fieldSchema) return {};

  if (fieldSchema.$ref) {
    const resolved = resolveRef(fieldSchema.$ref, rootSchema);
    return resolved || {};
  }

  return fieldSchema;
}

export function getPrimaryType(fieldSchema) {
  const type = Array.isArray(fieldSchema?.type)
    ? fieldSchema.type.find((t) => t !== "null")
    : fieldSchema?.type;

  return type;
}

export function prettifyKey(key = "") {
  const fallback = key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

  return getFriendlyLabel(key, fallback);
}

export function getInputType(fieldSchema) {
  const type = getPrimaryType(fieldSchema);

  if (fieldSchema?.enum) return "enum";
  if (type === "boolean") return "boolean";
  if (type === "integer" || type === "number") return "number";
  if (fieldSchema?.format === "date") return "date";
  if (fieldSchema?.format === "date-time") return "datetime-local";
  if (type === "array") return "array";
  if (type === "object") return "object";
  return "text";
}

export function isTextareaField(key = "", schema = {}) {
  const text =
    `${key} ${schema?.title || ""} ${schema?.description || ""}`.toLowerCase();

  return (
    text.includes("note") ||
    text.includes("description") ||
    text.includes("observation") ||
    text.includes("history") ||
    text.includes("documentation") ||
    text.includes("signal") ||
    text.includes("marks") ||
    text.includes("comment")
  );
}

export function setNestedValue(object, path, value) {
  const keys = path.split(".");
  const cloned = Array.isArray(object) ? [...object] : { ...object };

  let current = cloned;

  for (let i = 0; i < keys.length - 1; i++) {
    const rawKey = keys[i];
    const nextKey = isNaN(Number(rawKey)) ? rawKey : Number(rawKey);
    const nextValue = current[nextKey];

    if (Array.isArray(nextValue)) {
      current[nextKey] = [...nextValue];
    } else if (nextValue && typeof nextValue === "object") {
      current[nextKey] = { ...nextValue };
    } else {
      const lookAhead = keys[i + 1];
      current[nextKey] = isNaN(Number(lookAhead)) ? {} : [];
    }

    current = current[nextKey];
  }

  const lastRawKey = keys[keys.length - 1];
  const lastKey = isNaN(Number(lastRawKey)) ? lastRawKey : Number(lastRawKey);
  current[lastKey] = value;

  return cloned;
}

export function getNestedValue(object, path) {
  return path.split(".").reduce((acc, rawKey) => {
    const key = isNaN(Number(rawKey)) ? rawKey : Number(rawKey);
    return acc?.[key];
  }, object);
}

export function createEmptyFromSchema(fieldSchema, rootSchema) {
  const schema = normalizeSchemaField(fieldSchema, rootSchema);
  const type = getPrimaryType(schema);

  if (schema?.const !== undefined) return schema.const;

  if (schema?.enum) return "";

  if (type === "object") {
    const result = {};
    for (const [key, value] of Object.entries(schema.properties || {})) {
      result[key] = createEmptyFromSchema(value, rootSchema);
    }
    return result;
  }

  if (type === "array") {
    return [];
  }

  if (type === "boolean") return "";
  return "";
}

export function normalizeValueForInput(inputType, value) {
  if (value === null || value === undefined) return "";

  if (inputType === "datetime-local") {
    if (typeof value !== "string") return "";
    if (value.includes("T")) return value.slice(0, 16);
    return value;
  }

  return value;
}

export function parseValueFromInput(inputType, rawValue) {
  if (rawValue === "") return "";

  if (inputType === "number") return Number(rawValue);

  if (inputType === "boolean") {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
  }

  if (inputType === "datetime-local") {
    return rawValue ? new Date(rawValue).toISOString() : "";
  }

  return rawValue;
}

export function getRequiredFields(schema) {
  return Array.isArray(schema?.required) ? schema.required : [];
}

export function validateBySchema(schema, data, rootSchema, path = "") {
  const normalized = normalizeSchemaField(schema, rootSchema);
  const type = getPrimaryType(normalized);
  const errors = {};

  if (type === "object") {
    const required = getRequiredFields(normalized);

    for (const key of required) {
      const value = data?.[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (
        value === "" ||
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[currentPath] = "Campo obrigatório";
      }
    }

    for (const [key, childSchema] of Object.entries(
      normalized.properties || {},
    )) {
      const childPath = path ? `${path}.${key}` : key;
      const childErrors = validateBySchema(
        childSchema,
        data?.[key],
        rootSchema,
        childPath,
      );
      Object.assign(errors, childErrors);
    }
  }

  if (type === "array") {
    const items = Array.isArray(data) ? data : [];
    items.forEach((item, index) => {
      const childPath = path ? `${path}.${index}` : String(index);
      const childErrors = validateBySchema(
        normalized.items,
        item,
        rootSchema,
        childPath,
      );
      Object.assign(errors, childErrors);
    });
  }

  return errors;
}
