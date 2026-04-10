export const fieldLabels = {
  schemaVersion: "Versão do schema",
  datasetType: "Tipo de dataset",
  timestamp: "Data e hora de geração",
  author: "Autor responsável",

  systemId: "ID do sistema",
  specimen: "Espécime",
  species: "Espécie",
  tank: "Tanque",
  date: "Data",
  time: "Hora",
  startTime: "Hora de início",
  endTime: "Hora de término",
  notes: "Observações",
  observations: "Observações",
  reason: "Motivo",
  name: "Nome",

  scientificName: "Nome científico",
  specimenCode: "Código do espécime",
  alias: "Nome / apelido",
  sex: "Sexo",
  lifeStage: "Fase de vida",
  origin: "Origem",
  provenance: "Procedência",
  acquisitionDate: "Data de aquisição",

  weight: "Peso",
  length: "Comprimento",
  totalLength: "Comprimento total",

  temperature: "Temperatura",
  turbidity: "Turbidez",
  transparency: "Transparência",
  conductivity: "Condutividade",
  tds: "TDS",
  tss: "TSS",
  flowRate: "Vazão",
  currentSpeed: "Velocidade da corrente",
  waterColumn: "Coluna d'água",

  phReagent: "pH (reagente)",
  phPotentiometer: "pH (potenciômetro)",
  alkalinity: "Alcalinidade",
  generalHardnessGH: "Dureza geral (GH)",
  carbonateHardnessKH: "Dureza carbonatada (KH)",

  dissolvedOxygen: "Oxigênio dissolvido",
  dissolvedOxygenSaturation: "Saturação de oxigênio",
  dissolvedCO2: "CO₂ dissolvido",
  hydrogenSulfide: "Sulfeto de hidrogênio",
  orp: "ORP",

  airTemperature: "Temperatura do ar",
  relativeHumidity: "Umidade relativa",
  atmosphericPressure: "Pressão atmosférica",
  airSpeed: "Velocidade do ar",
  airExchangeRate: "Taxa de renovação do ar",

  lightIntensity: "Intensidade luminosa",
  photoperiod: "Fotoperíodo",
  lightSpectrum: "Espectro de luz",

  ambientCO2: "CO₂ ambiente",
  atmosphericPollutants: "Poluentes atmosféricos",
  noiseLevel: "Nível de ruído",

  latitude: "Latitude",
  longitude: "Longitude",
  altitude: "Altitude",
  klimaZone: "Zona climática",

  facilityId: "ID da instalação",
  facilityType: "Tipo de instalação",
  distanceToPollutionSources: "Distância de fontes poluentes",

  variable: "Variável",
  unit: "Unidade",
  minimum: "Mínimo",
  maximum: "Máximo",
  current: "Atual",
  average: "Média",

  generalActivity: "Atividade geral",
  feeding: "Alimentação",
  courtship: "Corte",
  socialInteraction: "Interação social",
  evidenceUrl: "URL de evidência",
  alarmSignals: "Sinais de alerta",
  gillMovements: "Movimentos branquiais",
};

export function getFriendlyLabel(key, fallback) {
  return fieldLabels[key] || fallback;
}
