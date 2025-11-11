const axios = require("axios");

/**
 * Extrae la fecha de un nombre de custom value, por ejemplo:
 * disponible-cabana-1-2025-10-28 → 2025-10-28
 */
function extractDateFromName(name) {
  const match = name.match(/\d{4}-\d{2}-\d{2}$/);
  return match ? match[0] : null;
}

/**
 * Extrae el tipo de habitación del nombre, por ejemplo:
 * disponible-cabana-1-2025-10-28 → cabana-1
 */
function extractRoomType(name) {
  const clean = name.replace(/^disponible-/, ""); // eliminar prefijo
  const parts = clean.split("-");
  const possibleDate = parts.slice(-3).join("-");
  // si las últimas partes parecen una fecha, se eliminan
  if (/^\d{4}-\d{2}-\d{2}$/.test(possibleDate)) {
    return parts.slice(0, -3).join("-");
  }
  return clean;
}

/**
 * Middleware que obtiene los valores de disponibilidad desde GoHighLevel
 */
const getCustomFieldsSecond = async (req, res, next) => {
  const { dateStart, dateEnd, roomType } = req.body; // Ejemplo: dateStart="2025-11-12", dateEnd="2025-11-19" roomType="cabana-1"
  const API_CUSTOM_FIELDS = "https://rest.gohighlevel.com/v1/custom-values";

  try {
    const response = await axios.get(API_CUSTOM_FIELDS, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY_PAL_SKY}`,
        "Content-Type": "application/json",
      },
    });

    const customValues = response.data?.customValues || [];

    // Mapa de disponibilidad: { "cabana-1": { "2025-10-28": 3, ... }, ... }
    const availabilityMap = {};

    for (const custom of customValues) {
      const { name, value } = custom;

      // Capturar cupos globales si existen
      if (name === "cupos-diarios-hotel-por-habitacion") {
        if (!availabilityMap["general"]) availabilityMap["general"] = {};
        availabilityMap["general"].dailyRoomLimit = parseInt(value, 10);
        continue;
      }

      // Solo procesar los campos que empiecen con "disponible-"
      if (!name.startsWith("disponible-")) continue;

      const date = extractDateFromName(name);
      const room = extractRoomType(name);
      if (!date || !room) continue;

      if (!availabilityMap[room]) availabilityMap[room] = {};
      availabilityMap[room][date] = parseInt(value, 10);
    }

    // Asignar disponibilidad específica si se pide
    if (roomType && dateStart && dateEnd) {
      const available =
        availabilityMap?.[roomType]?.[fecha] ??
        availabilityMap?.["general"]?.dailyRoomLimit ??
        0;

      req.body.placesAvailable = available;
    }

    // Dejar toda la estructura en el request por si se usa en validaciones posteriores
    req.body.availabilityMap = availabilityMap;

    next();
  } catch (error) {
    console.error("❌ Error al obtener los CUSTOM FIELDS:", error.message);
    res.status(500).json({
      error: "Error al obtener disponibilidad de habitaciones",
      details: error.message,
    });
  }
};

module.exports = getCustomFieldsSecond;
