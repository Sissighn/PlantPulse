import { describe, expect, it } from "vitest";
import {
  careEffortSummary,
  careRiskSummary,
  interpretAirHumidity,
  interpretCareData,
  interpretLight,
  interpretSoilMoisture,
  interpretTemperature,
} from "./careInterpretation";

describe("careInterpretation", () => {
  it("maps temperature values with fixed thresholds", () => {
    expect(interpretTemperature({ min: 10, max: 14 }).ruleKey).toBe("cold");
    expect(interpretTemperature({ min: 18, max: 22 }).ruleKey).toBe("normal");
    expect(interpretTemperature({ min: 24, max: 28 }).ruleKey).toBe("warm");
  });

  it("maps air humidity values with fixed thresholds", () => {
    expect(interpretAirHumidity({ min: 20, max: 30 }).ruleKey).toBe("dry");
    expect(interpretAirHumidity({ min: 40, max: 60 }).ruleKey).toBe("normal");
    expect(interpretAirHumidity({ min: 60, max: 80 }).ruleKey).toBe("humid");
  });

  it("maps soil moisture values with fixed thresholds", () => {
    expect(interpretSoilMoisture({ min: 10, max: 20 }).ruleKey).toBe("low");
    expect(interpretSoilMoisture({ min: 35, max: 45 }).ruleKey).toBe("medium");
    expect(interpretSoilMoisture({ min: 70, max: 90 }).ruleKey).toBe("high");
  });

  it("maps light values with fixed thresholds", () => {
    expect(interpretLight({ min: 500, max: 2000 }).ruleKey).toBe("low");
    expect(interpretLight({ min: 3000, max: 7000 }).ruleKey).toBe("medium");
    expect(interpretLight({ min: 10000, max: 14000 }).ruleKey).toBe("high");
  });

  it("returns the requested structured output format", () => {
    const result = interpretTemperature({ min: 18, max: 22 });

    expect(result).toEqual({
      rawValue: "18-22 °C",
      category: "temperature",
      ruleKey: "normal",
      interpretedLabelKey: "dic.careInterpretation.temperature.normal.interpretedLabel",
      simpleExplanationKey:
        "dic.careInterpretation.temperature.normal.simpleExplanation",
      actionAdviceKey: "dic.careInterpretation.temperature.normal.actionAdvice",
      riskMessageKey: "dic.careInterpretation.temperature.normal.riskMessage",
      riskLevel: "low",
    });
  });

  it("summarizes only prioritized risks", () => {
    const interpreted = interpretCareData({
      max_env_humid: 30,
      max_light_lux: 7000,
      max_soil_moist: 80,
      max_temp: 20,
      min_env_humid: 20,
      min_light_lux: 3000,
      min_soil_moist: 70,
      min_temp: 18,
    });

    expect(careRiskSummary(interpreted).items.map((item) => item.messageKey))
      .toEqual([
        "dic.careInterpretation.soilMoisture.high.riskMessage",
        "dic.careInterpretation.airHumidity.dry.riskMessage",
      ]);
  });

  it("classifies care effort with fixed rules", () => {
    const easy = interpretCareData({
      max_env_humid: 55,
      max_light_lux: 7000,
      max_soil_moist: 45,
      max_temp: 22,
      min_env_humid: 45,
      min_light_lux: 3000,
      min_soil_moist: 35,
      min_temp: 18,
    });
    const demanding = interpretCareData({
      max_env_humid: 85,
      max_light_lux: 14000,
      max_soil_moist: 80,
      max_temp: 28,
      min_env_humid: 65,
      min_light_lux: 10000,
      min_soil_moist: 70,
      min_temp: 24,
    });

    expect(careEffortSummary(easy)).toMatchObject({
      labelKey: "dic.careInterpretation.effort.easy.label",
      level: "easy",
    });
    expect(careEffortSummary(demanding)).toMatchObject({
      labelKey: "dic.careInterpretation.effort.demanding.label",
      level: "demanding",
    });
  });

  it("classifies broad API ranges by environmental effort, not plant names", () => {
    const monsteraLikeRaw = {
      max_env_humid: 85,
      max_light_lux: 15000,
      max_soil_moist: 60,
      max_temp: 32,
      min_env_humid: 30,
      min_light_lux: 800,
      min_soil_moist: 15,
      min_temp: 12,
    };
    const calatheaLikeRaw = {
      ...monsteraLikeRaw,
      min_env_humid: 50,
      min_soil_moist: 30,
      max_light_lux: 20000,
      max_soil_moist: 65,
    };
    const fernLikeRaw = {
      max_env_humid: 90,
      max_light_lux: 4000,
      max_soil_moist: 60,
      max_temp: 32,
      min_env_humid: 40,
      min_light_lux: 300,
      min_soil_moist: 15,
      min_temp: 10,
    };

    expect(
      careEffortSummary(interpretCareData(monsteraLikeRaw), monsteraLikeRaw),
    ).toMatchObject({
      labelKey: "dic.careInterpretation.effort.easy.label",
      level: "easy",
    });

    expect(
      careEffortSummary(interpretCareData(calatheaLikeRaw), calatheaLikeRaw),
    ).toMatchObject({
      labelKey: "dic.careInterpretation.effort.demanding.label",
      level: "demanding",
    });

    expect(
      careEffortSummary(interpretCareData(fernLikeRaw), fernLikeRaw),
    ).toMatchObject({
      labelKey: "dic.careInterpretation.effort.demanding.label",
      level: "demanding",
    });
  });
});
