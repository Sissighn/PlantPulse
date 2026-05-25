export const DEFAULT_BASE_INTERVAL = 7;

export const PROFILE_TYPES = {
  tropical: {
    spring: 1,
    summer: 0.75,
    autumn: 1.2,
    winter: 1.6,
  },
  moisture: {
    spring: 0.9,
    summer: 0.7,
    autumn: 1.15,
    winter: 1.4,
  },
  succulent: {
    spring: 1,
    summer: 0.9,
    autumn: 1.4,
    winter: 2.4,
  },
  cactus: {
    spring: 1,
    summer: 0.85,
    autumn: 1.6,
    winter: 3,
  },
  dormantBloomer: {
    spring: 1,
    summer: 1.15,
    autumn: 0.9,
    winter: 0.85,
  },
};

export const PLANT_WATERING_PROFILES = {
  monstra: { aliases: ["monstera"], baseInterval: 7, profileType: "tropical" },
  anthurium: { aliases: ["anthurium"], baseInterval: 6, profileType: "tropical" },
  orchid: { aliases: ["orchidee", "orchid"], baseInterval: 7, profileType: "tropical" },
  philodendronmccolleysfinale: { aliases: ["philodendron"], baseInterval: 7, profileType: "tropical" },
  usambaraveilchen: { aliases: ["usambara veilchen", "african violet"], baseInterval: 5, profileType: "moisture" },
  yucca: { aliases: ["yucca"], baseInterval: 14, profileType: "succulent" },
  kalanchoe: { aliases: ["kalanchoe"], baseInterval: 14, profileType: "succulent" },
  peperomiaobtusifolia: { aliases: ["peperomia obtusifolia"], baseInterval: 10, profileType: "succulent" },
  peperomiarotundifolia: { aliases: ["peperomia rotundifolia"], baseInterval: 8, profileType: "tropical" },
  iddleleaffig: { aliases: ["fiddle leaf fig", "ficus lyrata"], baseInterval: 7, profileType: "tropical" },
  dieffenbachia: { aliases: ["dieffenbachia"], baseInterval: 7, profileType: "tropical" },
  schlumbergera: { aliases: ["schlumbergera", "christmas cactus"], baseInterval: 10, profileType: "dormantBloomer" },
  aloevera: { aliases: ["aloe vera"], baseInterval: 18, profileType: "succulent" },
  chlorophytum: { aliases: ["chlorophytum", "spider plant"], baseInterval: 7, profileType: "tropical" },
  calatheaorbifolia: { aliases: ["calathea orbifolia"], baseInterval: 5, profileType: "moisture" },
  ficuselastica: { aliases: ["ficus elastica", "rubber plant"], baseInterval: 8, profileType: "tropical" },
  epipremnumaureum: { aliases: ["epipremnum aureum", "pothos"], baseInterval: 8, profileType: "tropical" },
  zamioculcas: { aliases: ["zamioculcas", "zz plant"], baseInterval: 21, profileType: "succulent" },
  sansevieria: { aliases: ["sansevieria", "snake plant"], baseInterval: 21, profileType: "succulent" },
  echinopsissubdenudata: { aliases: ["echinopsis subdenudata"], baseInterval: 18, profileType: "cactus" },
  mammillariaelongata: { aliases: ["mammillaria elongata"], baseInterval: 18, profileType: "cactus" },
  opuntiamicrodasys: { aliases: ["opuntia microdasys"], baseInterval: 18, profileType: "cactus" },
  rebutiaheliosa: { aliases: ["rebutia heliosa"], baseInterval: 18, profileType: "cactus" },
  sedummorganianum: { aliases: ["sedum morganianum"], baseInterval: 16, profileType: "succulent" },
  spathiphyllum: { aliases: ["spathiphyllum", "peace lily"], baseInterval: 5, profileType: "moisture" },
  hibiscusrosasinensis: { aliases: ["hibiscus rosa sinensis"], baseInterval: 4, profileType: "moisture" },
  bromeliaguzmania: { aliases: ["bromelia guzmania", "guzmania"], baseInterval: 7, profileType: "tropical" },
  cliviaminiata: { aliases: ["clivia miniata"], baseInterval: 10, profileType: "dormantBloomer" },
  gardeniajasminoides: { aliases: ["gardenia jasminoides"], baseInterval: 4, profileType: "moisture" },
};

function normalize(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getPlantProfile(plant) {
  const candidates = [plant?.type, plant?.name].map(normalize).filter(Boolean);

  for (const candidate of candidates) {
    if (PLANT_WATERING_PROFILES[candidate]) {
      return PLANT_WATERING_PROFILES[candidate];
    }
  }

  return Object.values(PLANT_WATERING_PROFILES).find((profile) =>
    profile.aliases.some((alias) => candidates.includes(normalize(alias))),
  );
}
