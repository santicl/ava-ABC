const axios = require("axios");

function getDateCustomValues(obj) {
  return obj.name.replace('disponible-hotel-', '');
}

const getCustomFields = async (req, res, next) => {
    const { fecha } = req.body
    const API_CUSTOM_FIELDS = 'https://rest.gohighlevel.com/v1/custom-values'

    try {
        const response = await axios.get(API_CUSTOM_FIELDS, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY_PAL_SKY}`,
                'Content-Type': 'application/json'
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
            } else if(custom.name === 'cupos-diarios-hotel-por-habitacion') {
                req.body.placesAvailable = parseInt(custom.value)
            }
        });
        next()
    } catch (error) {
        console.error('X Error al obtener los CUSTOM FIELDS')
    }
}

module.exports = getCustomFields