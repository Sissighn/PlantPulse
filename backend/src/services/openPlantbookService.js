require("dotenv").config();

const BASE_URL =
  process.env.OPEN_PLANTBOOK_BASE_URL || "https://open.plantbook.io/api/v1";

function serviceError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getConfiguredAccessToken() {
  return (
    process.env.OPEN_PLANTBOOK_ACCESS_TOKEN || process.env.PLANTBOOK_ACCESS_TOKEN
  );
}

function getClientCredentials() {
  return {
    clientId: process.env.OPEN_PLANTBOOK_CLIENT_ID || process.env.PLANTBOOK_CLIENT_ID,
    clientSecret:
      process.env.OPEN_PLANTBOOK_CLIENT_SECRET || process.env.PLANTBOOK_CLIENT_SECRET,
  };
}

let tokenCache = {
  accessToken: getConfiguredAccessToken() || null,
  expiresAt: getConfiguredAccessToken() ? Number.POSITIVE_INFINITY : 0,
  fromStaticToken: Boolean(getConfiguredAccessToken()),
};

const responseCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 20;

function isConfigured() {
  const { clientId, clientSecret } = getClientCredentials();
  return Boolean(getConfiguredAccessToken() || (clientId && clientSecret));
}

function getCached(key) {
  const cached = responseCache.get(key);
  if (!cached || cached.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return cached.value;
}

function setCached(key, value) {
  responseCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  });
}

async function getAccessToken() {
  if (tokenCache.accessToken && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret } = getClientCredentials();

  if (!clientId || !clientSecret) {
    throw serviceError("Open Plantbook credentials are missing.", 503);
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${BASE_URL}/token/`, {
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!res.ok) {
    throw serviceError(
      `Open Plantbook token request failed: HTTP ${res.status}`,
      502
    );
  }

  const data = await res.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + ((data.expires_in || 3600) - 60) * 1000,
    fromStaticToken: false,
  };

  return tokenCache.accessToken;
}

async function request(endpoint, params = {}, hasRetried = false) {
  if (!isConfigured()) {
    throw serviceError("Open Plantbook is not configured.", 503);
  }

  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 && tokenCache.fromStaticToken && !hasRetried) {
    tokenCache = { accessToken: null, expiresAt: 0, fromStaticToken: false };
    return request(endpoint, params, true);
  }

  if (!res.ok) {
    throw serviceError(`Open Plantbook request failed: HTTP ${res.status}`, 502);
  }

  return res.json();
}

function firstValue(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return null;
}

function compactRange(min, max, unit = "") {
  if (min !== null && max !== null) return `${min}-${max}${unit}`;
  if (min !== null) return `ab ${min}${unit}`;
  if (max !== null) return `bis ${max}${unit}`;
  return null;
}

function normalizeSearchResult(plant) {
  return {
    alias: firstValue(plant, ["alias", "common_name", "name"]),
    category: firstValue(plant, ["category", "plant_category"]),
    displayPid: firstValue(plant, ["display_pid", "displayPid"]),
    imageUrl: firstValue(plant, ["image_url", "imageUrl"]),
    pid: firstValue(plant, ["pid", "display_pid", "id"]),
    scientificName: firstValue(plant, ["species", "scientific_name", "scientificName"]),
  };
}

async function getPlantImageUrl(pid, lang) {
  const cacheKey = `detail:${lang}:${pid}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.imageUrl;

  try {
    const detail = await exports.getPlantDetail(pid, { lang });
    return detail.imageUrl;
  } catch {
    return null;
  }
}

function normalizeDetail(plant) {
  const care = plant.care || {};
  const lightMin = firstValue(plant, ["min_light_lux", "light_lux_min", "min_light"]);
  const lightMax = firstValue(plant, ["max_light_lux", "light_lux_max", "max_light"]);
  const tempMin = firstValue(plant, ["min_temp", "min_temperature", "min_temperature_c"]);
  const tempMax = firstValue(plant, ["max_temp", "max_temperature", "max_temperature_c"]);
  const soilMin = firstValue(plant, ["min_soil_moist", "min_moist", "min_soil_moisture"]);
  const soilMax = firstValue(plant, ["max_soil_moist", "max_moist", "max_soil_moisture"]);
  const airMin = firstValue(plant, ["min_env_humid", "min_air_humidity"]);
  const airMax = firstValue(plant, ["max_env_humid", "max_air_humidity"]);

  return {
    ...normalizeSearchResult(plant),
    description: firstValue(plant, ["description", "desc"]),
    origin: firstValue(plant, ["origin"]),
    raw: plant,
    care: {
      fertilization: firstValue(care, ["fertilization", "fertilizing", "fertilizer"]),
      pruning: firstValue(care, ["pruning"]),
      soil: firstValue(care, ["soil"]),
      sunlight: firstValue(care, ["sunlight", "light"]),
      watering: firstValue(care, ["watering", "water"]),
    },
    environment: {
      airHumidity: compactRange(airMin, airMax, "%"),
      light: compactRange(lightMin, lightMax, " lux"),
      soilMoisture: compactRange(soilMin, soilMax, "%"),
      temperature: compactRange(tempMin, tempMax, " °C"),
    },
  };
}

exports.searchPlants = async (query, { limit = 12, lang = "de" } = {}) => {
  const normalizedQuery = String(query || "").trim();
  if (normalizedQuery.length < 2) return [];

  const cacheKey = `search:${lang}:${limit}:${normalizedQuery.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await request("/plant/search", {
    alias: normalizedQuery,
    lang,
    limit,
  });
  const results = (data.results || []).map(normalizeSearchResult).filter((p) => p.pid);
  const enrichedResults = await Promise.all(
    results.map(async (plant) => ({
      ...plant,
      imageUrl: plant.imageUrl || (await getPlantImageUrl(plant.pid, lang)),
    })),
  );
  setCached(cacheKey, enrichedResults);
  return enrichedResults;
};

exports.getPlantDetail = async (pid, { lang = "de" } = {}) => {
  const safePid = String(pid || "").trim();
  if (!safePid) throw serviceError("Plant PID is required.", 400);

  const cacheKey = `detail:${lang}:${safePid}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await request(`/plant/detail/${encodeURIComponent(safePid)}`, {
    include: "*",
    lang,
  });
  const detail = normalizeDetail(data);
  setCached(cacheKey, detail);
  return detail;
};

exports.isConfigured = isConfigured;
