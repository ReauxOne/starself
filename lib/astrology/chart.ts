import * as Astronomy from "astronomy-engine";

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const PLANET_BODIES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

export type PlanetBody = (typeof PLANET_BODIES)[number];

export interface BirthInput {
  /** Birth date/time already converted to UTC. */
  dateUtc: Date;
  /** Decimal degrees, north positive. */
  latitude: number;
  /** Decimal degrees, east positive. */
  longitude: number;
}

export interface ChartPosition {
  /** Ecliptic longitude in degrees, 0-360. */
  eclipticLongitude: number;
  sign: ZodiacSign;
  /** Degrees into the sign, 0-30. */
  degreeInSign: number;
  /** Whole-sign house number, 1-12. */
  house: number;
}

export interface PlanetPosition extends ChartPosition {
  body: PlanetBody;
}

export interface BirthChart {
  ascendant: ChartPosition;
  planets: PlanetPosition[];
}

function signAndDegree(eclipticLongitude: number): { sign: ZodiacSign; degreeInSign: number } {
  const normalized = ((eclipticLongitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degreeInSign: normalized - signIndex * 30,
  };
}

function wholeSignHouse(bodySign: ZodiacSign, ascendantSign: ZodiacSign): number {
  const bodyIndex = ZODIAC_SIGNS.indexOf(bodySign);
  const ascIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
  return ((bodyIndex - ascIndex + 12) % 12) + 1;
}

/**
 * Ascendant via the standard RAMC + obliquity formula (Meeus / Astrolabe).
 * house() below assigns whole-sign houses from this.
 */
function calculateAscendant(time: Astronomy.AstroTime, latitude: number, longitude: number): number {
  const gastHours = Astronomy.SiderealTime(time);
  const ramcDeg = (gastHours * 15 + longitude + 360) % 360;
  const obliquityDeg = Astronomy.e_tilt(time).tobl;

  const ramcRad = (ramcDeg * Math.PI) / 180;
  const obliquityRad = (obliquityDeg * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(obliquityRad) + Math.tan(latRad) * Math.sin(obliquityRad);

  const ascRad = Math.atan2(y, x);
  return ((ascRad * 180) / Math.PI + 360) % 360;
}

export function calculateBirthChart(input: BirthInput): BirthChart {
  const time = Astronomy.MakeTime(input.dateUtc);

  const ascendantLongitude = calculateAscendant(time, input.latitude, input.longitude);
  const { sign: ascendantSign, degreeInSign: ascendantDegree } = signAndDegree(ascendantLongitude);

  const ascendant: ChartPosition = {
    eclipticLongitude: ascendantLongitude,
    sign: ascendantSign,
    degreeInSign: ascendantDegree,
    house: 1,
  };

  const planets: PlanetPosition[] = PLANET_BODIES.map((body) => {
    const vector = Astronomy.GeoVector(body as unknown as Astronomy.Body, time, true);
    const ecliptic = Astronomy.Ecliptic(vector);
    const { sign, degreeInSign } = signAndDegree(ecliptic.elon);

    return {
      body,
      eclipticLongitude: ecliptic.elon,
      sign,
      degreeInSign,
      house: wholeSignHouse(sign, ascendantSign),
    };
  });

  return { ascendant, planets };
}
