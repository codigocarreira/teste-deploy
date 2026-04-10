import { useState } from "react";
import {
  normalizeSchemaField,
  getInputType,
  prettifyKey,
  isTextareaField,
  normalizeValueForInput,
  parseValueFromInput,
  createEmptyFromSchema,
  getRequiredFields,
} from "../../../utils/schemaFormUtils";

function FieldRenderer({
  fieldKey,
  fieldSchema,
  rootSchema,
  value,
  path,
  onChange,
  errors = {},
  parentRequired = [],
}) {
  const normalized = normalizeSchemaField(fieldSchema, rootSchema);
  const inputType = getInputType(normalized);
  const label = normalized.title || prettifyKey(fieldKey);
  const helpText = normalized.description || "";
  const enumOptions = (normalized.enum || []).filter((item) => item !== null);
  const required = parentRequired.includes(fieldKey);
  const hasError = Boolean(errors[path]);

  const labelContent = (
    <div className="field-label-row">
      <label className="field-label">{label}</label>
      {required && <span className="field-required">Obligatorio</span>}
    </div>
  );

  if (inputType === "object") {
    const childRequired = getRequiredFields(normalized);

    return (
      <div className="field-card full">
        <div className="subsection-block">
          <h3>{label}</h3>
          {helpText && <p>{helpText}</p>}

          <div className="field-grid">
            {Object.entries(normalized.properties || {}).map(
              ([childKey, childSchema]) => (
                <FieldRenderer
                  key={`${path}.${childKey}`}
                  fieldKey={childKey}
                  fieldSchema={childSchema}
                  rootSchema={rootSchema}
                  value={value?.[childKey]}
                  path={`${path}.${childKey}`}
                  onChange={onChange}
                  errors={errors}
                  parentRequired={childRequired}
                />
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  if (inputType === "array") {
    const itemSchema = normalized.items;
    const items = Array.isArray(value) ? value : [];
    const itemNormalized = normalizeSchemaField(itemSchema, rootSchema);
    const itemType = getInputType(itemNormalized);

    const handleAddItem = () => {
      const emptyItem = createEmptyFromSchema(itemSchema, rootSchema);
      onChange(path, [...items, emptyItem]);
    };

    const handleRemoveItem = (index) => {
      const updated = items.filter((_, itemIndex) => itemIndex !== index);
      onChange(path, updated);
    };

    return (
      <div className="field-card full">
        <div className="subsection-block">
          <div className="field-label-row">
            <h3>{label}</h3>
            {required && <span className="field-required">Obligatorio</span>}
          </div>

          {helpText && <p>{helpText}</p>}

          {items.length === 0 && (
            <p className="field-help">Ningún ítem agregado aún.</p>
          )}

          {items.map((item, index) => {
            const basePath = `${path}.${index}`;
            const itemRequired = getRequiredFields(itemNormalized);

            return (
              <div className="array-item-card" key={basePath}>
                <div className="array-item-header">
                  <strong>Ítem {index + 1}</strong>

                  <div className="array-item-actions">
                    <button
                      type="button"
                      className="small-button danger"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {itemType === "object" ? (
                  <div className="field-grid">
                    {Object.entries(itemNormalized.properties || {}).map(
                      ([childKey, childSchema]) => (
                        <FieldRenderer
                          key={`${basePath}.${childKey}`}
                          fieldKey={childKey}
                          fieldSchema={childSchema}
                          rootSchema={rootSchema}
                          value={item?.[childKey]}
                          path={`${basePath}.${childKey}`}
                          onChange={onChange}
                          errors={errors}
                          parentRequired={itemRequired}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <FieldRenderer
                    fieldKey={fieldKey}
                    fieldSchema={itemSchema}
                    rootSchema={rootSchema}
                    value={item}
                    path={basePath}
                    onChange={onChange}
                    errors={errors}
                    parentRequired={[]}
                  />
                )}
              </div>
            );
          })}

          <button
            type="button"
            className="small-button"
            onClick={handleAddItem}
          >
            Agregar ítem
          </button>
        </div>
      </div>
    );
  }

  if (inputType === "enum") {
    return (
      <div className="field-card">
        {labelContent}
        {helpText && <span className="field-help">{helpText}</span>}
        <select
          className={`field-select ${hasError ? "field-error" : ""}`}
          value={normalizeValueForInput(inputType, value)}
          onChange={(e) => onChange(path, e.target.value)}
        >
          <option value="">Selecciona</option>
          {enumOptions.map((option) => (
            <option key={String(option)} value={option}>
              {String(option)}
            </option>
          ))}
        </select>
        {hasError && <span className="field-error-text">{errors[path]}</span>}
      </div>
    );
  }

  if (inputType === "boolean") {
    return (
      <div className="field-card">
        {labelContent}
        {helpText && <span className="field-help">{helpText}</span>}
        <select
          className={`field-select ${hasError ? "field-error" : ""}`}
          value={value === "" ? "" : String(value)}
          onChange={(e) =>
            onChange(path, parseValueFromInput("boolean", e.target.value))
          }
        >
          <option value="">Selecciona</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
        {hasError && <span className="field-error-text">{errors[path]}</span>}
      </div>
    );
  }

  if (isTextareaField(fieldKey, normalized)) {
    return (
      <div className="field-card full">
        {labelContent}
        {helpText && <span className="field-help">{helpText}</span>}
        <textarea
          className={`field-textarea ${hasError ? "field-error" : ""}`}
          value={normalizeValueForInput(inputType, value)}
          onChange={(e) => onChange(path, e.target.value)}
          placeholder={`Escribe ${label.toLowerCase()}`}
        />
        {hasError && <span className="field-error-text">{errors[path]}</span>}
      </div>
    );
  }

  return (
    <div className="field-card">
      {labelContent}
      {helpText && <span className="field-help">{helpText}</span>}
      <input
        className={`field-input ${hasError ? "field-error" : ""}`}
        type={inputType === "number" ? "number" : inputType}
        value={normalizeValueForInput(inputType, value)}
        onChange={(e) =>
          onChange(path, parseValueFromInput(inputType, e.target.value))
        }
        placeholder={`Escribe ${label.toLowerCase()}`}
      />
      {hasError && <span className="field-error-text">{errors[path]}</span>}
    </div>
  );
}

export default function SchemaSection({
  title,
  description,
  properties,
  rootSchema,
  sectionPath = "",
  data,
  onChange,
  defaultOpen = false,
  errors = {},
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const required = getRequiredFields({ properties, required: [] });

  return (
    <section className="dataset-section">
      <button
        type="button"
        className="dataset-section-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="dataset-section-title">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <span className="dataset-section-icon">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="dataset-section-content">
          <div className="field-grid">
            {Object.entries(properties || {}).map(([fieldKey, fieldSchema]) => (
              <FieldRenderer
                key={`${sectionPath}.${fieldKey}`}
                fieldKey={fieldKey}
                fieldSchema={fieldSchema}
                rootSchema={rootSchema}
                value={data?.[fieldKey]}
                path={sectionPath ? `${sectionPath}.${fieldKey}` : fieldKey}
                onChange={onChange}
                errors={errors}
                parentRequired={required}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
