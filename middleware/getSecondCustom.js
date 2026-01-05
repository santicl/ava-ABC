const axios = require("axios");

/**
 * Middleware que obtiene los valores de disponibilidad desde GoHighLevel
 */
const getCustomFieldsSecond = async (req, res, next) => {
  const API_CUSTOM_FIELDSOLD = "https://rest.gohighlevel.com/v1/custom-values";
  const API_CUSTOM_FIELDS = "https://services.leadconnectorhq.com/locations/Tj4NiJF6Qivkm3fs8dax/customValues"

  try {
    const response = await axios.get(API_CUSTOM_FIELDS, {
      headers: {
        'Version': '2021-07-28',
        Authorization: `Bearer ${process.env.API_KEY_ATOLON}`,
        "Content-Type": "application/json",
        'Accept': 'application/json',
      },
    });

    const customValues = response.data?.customValues || [];

    // Dejar toda la estructura en el request por si se usa en validaciones posteriores
    req.body.customValues = customValues;

    next();
  } catch (error) {
    console.error("❌ Error al obtener los CUSTOM FIELDS:", error.message);
    res.status(500).json({
      error: "Error al obtener disponibilidad de Disponibilidades",
      details: error.message,
    });
  }
};

module.exports = getCustomFieldsSecond;
