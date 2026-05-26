const RULES = {
  airHumidity: {
    dry: { riskLevel: "medium" },
    humid: { riskLevel: "medium" },
    normal: { riskLevel: "low" },
  },
  light: {
    high: { riskLevel: "medium" },
    low: { riskLevel: "medium" },
    medium: { riskLevel: "low" },
  },
  soilMoisture: {
    high: { riskLevel: "high" },
    low: { riskLevel: "medium" },
    medium: { riskLevel: "low" },
  },
  temperature: {
    cold: { riskLevel: "high" },
    normal: { riskLevel: "low" },
    warm: { riskLevel: "medium" },
  },
};

const RISK_WEIGHT = { high: 3, medium: 2, low: 1 };
const CATEGORY_PRIORITY = ["soilMoisture", "airHumidity", "temperature", "light"];
const EFFORT_WEIGHT = { high: 2, medium: 1, low: 0 };

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function midpoint(min, max) {
  if (min !== null && max !== null) return (min + max) / 2;
  return min ?? max;
}

function rangeLabel(min, max, unit) {
  if (min !== null && max !== null) return `${min}-${max}${unit}`;
  if (min !== null) return `${min}${unit}`;
  if (max !== null) return `${max}${unit}`;
  return "";
}

function makeResult(category, ruleKey, rawValue) {
  if (!rawValue || !ruleKey) {
    return {
      rawValue: rawValue || "",
      category,
      ruleKey: "unavailable",
      interpretedLabelKey: "dic.careInterpretation.unavailable.interpretedLabel",
      simpleExplanationKey: "dic.careInterpretation.unavailable.simpleExplanation",
      actionAdviceKey: "dic.careInterpretation.unavailable.actionAdvice",
      riskLevel: "low",
    };
  }

  return {
    rawValue,
    category,
    ruleKey,
    interpretedLabelKey: `dic.careInterpretation.${category}.${ruleKey}.interpretedLabel`,
    simpleExplanationKey: `dic.careInterpretation.${category}.${ruleKey}.simpleExplanation`,
    actionAdviceKey: `dic.careInterpretation.${category}.${ruleKey}.actionAdvice`,
    riskMessageKey: `dic.careInterpretation.${category}.${ruleKey}.riskMessage`,
    riskLevel: RULES[category][ruleKey].riskLevel,
  };
}

export function interpretTemperature({ min, max }) {
  const minValue = numberOrNull(min);
  const maxValue = numberOrNull(max);
  const value = midpoint(minValue, maxValue);
  const rawValue = rangeLabel(minValue, maxValue, " °C");

  if (value === null) return makeResult("temperature", null, rawValue);
  if (value < 15) return makeResult("temperature", "cold", rawValue);
  if (value >= 24) return makeResult("temperature", "warm", rawValue);
  return makeResult("temperature", "normal", rawValue);
}

export function interpretAirHumidity({ min, max }) {
  const minValue = numberOrNull(min);
  const maxValue = numberOrNull(max);
  const value = midpoint(minValue, maxValue);
  const rawValue = rangeLabel(minValue, maxValue, "%");

  if (value === null) return makeResult("airHumidity", null, rawValue);
  if (value < 40) return makeResult("airHumidity", "dry", rawValue);
  if (value >= 60) return makeResult("airHumidity", "humid", rawValue);
  return makeResult("airHumidity", "normal", rawValue);
}

export function interpretSoilMoisture({ min, max }) {
  const minValue = numberOrNull(min);
  const maxValue = numberOrNull(max);
  const value = midpoint(minValue, maxValue);
  const rawValue = rangeLabel(minValue, maxValue, "%");

  if (value === null) return makeResult("soilMoisture", null, rawValue);
  if (value < 30) return makeResult("soilMoisture", "low", rawValue);
  if (value >= 60) return makeResult("soilMoisture", "high", rawValue);
  return makeResult("soilMoisture", "medium", rawValue);
}

export function interpretLight({ min, max }) {
  const minValue = numberOrNull(min);
  const maxValue = numberOrNull(max);
  const value = midpoint(minValue, maxValue);
  const rawValue = rangeLabel(minValue, maxValue, " lux");

  if (value === null) return makeResult("light", null, rawValue);
  if (value < 2500) return makeResult("light", "low", rawValue);
  if (value >= 10000) return makeResult("light", "high", rawValue);
  return makeResult("light", "medium", rawValue);
}

export function interpretCareData(raw = {}) {
  return {
    temperature: interpretTemperature({ min: raw.min_temp, max: raw.max_temp }),
    airHumidity: interpretAirHumidity({
      min: raw.min_env_humid,
      max: raw.max_env_humid,
    }),
    soilMoisture: interpretSoilMoisture({
      min: raw.min_soil_moist,
      max: raw.max_soil_moist,
    }),
    light: interpretLight({
      min: raw.min_light_lux,
      max: raw.max_light_lux,
    }),
  };
}

export function careRiskSummary(interpretations = {}) {
  const risks = CATEGORY_PRIORITY.map((key, index) => ({
    key,
    index,
    riskLevel: interpretations[key]?.riskLevel || "low",
    messageKey: interpretations[key]?.riskMessageKey,
  }))
    .filter((risk) => risk.riskLevel !== "low" && risk.messageKey)
    .sort((a, b) => {
      const riskDiff = RISK_WEIGHT[b.riskLevel] - RISK_WEIGHT[a.riskLevel];
      return riskDiff || a.index - b.index;
    })
    .slice(0, 3);

  return {
    items: risks,
    summaryKey:
      risks.length === 0 ? "dic.careInterpretation.riskSummaryNone" : null,
  };
}

export function careEffortSummary(interpretations = {}, raw = {}) {
  const fallbackItems = CATEGORY_PRIORITY.map((key) => ({
    key,
    weight: EFFORT_WEIGHT[interpretations[key]?.riskLevel || "low"],
  })).filter((item) => item.weight > 0);
  const formulaItems = calculateEffortItems(raw);
  const effortItems = formulaItems.length > 0 ? formulaItems : fallbackItems;
  const score = effortItems.reduce((sum, item) => sum + item.weight, 0);
  const level = score >= 4 ? "demanding" : score >= 2 ? "medium" : "easy";
  const reasons = mergeEffortItems(effortItems)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((item) => ({
      key: item.key,
      reasonKey: `dic.careInterpretation.effortReasons.${item.key}`,
      weight: item.weight,
    }));

  return {
    level,
    labelKey: `dic.careInterpretation.effort.${level}.label`,
    explanationKey: `dic.careInterpretation.effort.${level}.explanation`,
    reasons,
    score,
  };
}

function calculateEffortItems(raw = {}) {
  const items = [];
  const add = (key, weight) => {
    if (weight > 0) items.push({ key, weight });
  };

  const minHumidity = numberOrNull(raw.min_env_humid);
  const maxHumidity = numberOrNull(raw.max_env_humid);
  const minLight = numberOrNull(raw.min_light_lux);
  const maxLight = numberOrNull(raw.max_light_lux);
  const minSoil = numberOrNull(raw.min_soil_moist);
  const maxSoil = numberOrNull(raw.max_soil_moist);
  const minTemp = numberOrNull(raw.min_temp);
  const maxTemp = numberOrNull(raw.max_temp);
  const lightWidth =
    minLight !== null && maxLight !== null ? maxLight - minLight : null;
  const tempWidth =
    minTemp !== null && maxTemp !== null ? maxTemp - minTemp : null;

  if (minHumidity !== null) {
    if (minHumidity >= 60) add("airHumidity", 3);
    else if (minHumidity >= 50) add("airHumidity", 2);
    else if (minHumidity >= 40) add("airHumidity", 1);
  }
  if (maxHumidity !== null && maxHumidity >= 85) add("airHumidity", 1);

  if (minSoil !== null) {
    if (minSoil >= 45) add("soilMoisture", 3);
    else if (minSoil >= 30) add("soilMoisture", 1);
  }
  if (maxSoil !== null && maxSoil >= 65) add("soilMoisture", 1);

  if (minLight !== null) {
    if (minLight >= 10000) add("light", 3);
    else if (minLight >= 5000) add("light", 2);
    else if (minLight >= 2500) add("light", 1);
  }
  if (maxLight !== null) {
    if (maxLight <= 5000) add("light", 2);
    else if (maxLight <= 8000) add("light", 1);
    else if (maxLight >= 18000) add("light", 1);
  }
  if (lightWidth !== null && lightWidth <= 5000) add("light", 1);

  if (minTemp !== null && minTemp >= 20) add("temperature", 2);
  else if (minTemp !== null && minTemp >= 16) add("temperature", 1);
  if (maxTemp !== null && maxTemp <= 22) add("temperature", 1);
  if (tempWidth !== null && tempWidth <= 8) add("temperature", 1);

  if (
    maxHumidity !== null &&
    maxSoil !== null &&
    maxHumidity >= 80 &&
    maxSoil >= 65
  ) {
    add("airHumidity", 1);
    add("soilMoisture", 1);
  }
  if (
    maxHumidity !== null &&
    maxLight !== null &&
    maxHumidity >= 80 &&
    maxLight <= 5000
  ) {
    add("airHumidity", 1);
    add("light", 1);
  }
  if (
    maxSoil !== null &&
    maxLight !== null &&
    maxSoil >= 65 &&
    maxLight >= 18000
  ) {
    add("soilMoisture", 1);
    add("light", 1);
  }

  return items;
}

function mergeEffortItems(items) {
  const merged = new Map();
  for (const item of items) {
    const current = merged.get(item.key) || 0;
    merged.set(item.key, current + item.weight);
  }

  return Array.from(merged.entries()).map(([key, weight]) => ({ key, weight }));
}
