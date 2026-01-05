const axios = require("axios");

function getDateCustomValues(obj) {
  return obj.name.replace('disponible-experience-', '');
}

const getCustomFields = async (req, res, next) => {
    const { fecha } = req.body
    const API_CUSTOM_FIELDS = "https://services.leadconnectorhq.com/locations/Tj4NiJF6Qivkm3fs8dax/customValues"

    try {
        const response = await axios.get(API_CUSTOM_FIELDS, {
            headers: {
                'Version': '2021-07-28',
                'Authorization': `Bearer ${process.env.API_KEY_ATOLON}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        console.log(response)

        if (!response.data) {
            return res.status(500).json({ error: 'No se pudo obtener los datos' });
        }

        const customValues = response.data.customValues
        
        customValues.forEach(custom => {
            const dateCustom = getDateCustomValues(custom)
            if (fecha === dateCustom) {
                req.body.placesAvailable = parseInt(custom.value)
            } else if(custom.name === 'cupos-diarios-experience') {
                req.body.placesAvailable = parseInt(custom.value)
            }
        });
        next()
    } catch (error) {
        console.error('X Error al obtener los CUSTOM FIELDS')
    }
}

module.exports = getCustomFields