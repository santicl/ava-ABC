const axios = require("axios");

// Función reutilizable para obtener submissions paginados
const getSubmissions = async (formId, limit = 100) => {
    let page = 1;
    let allSubmissions = [];
    let hasMore = true;

    while (hasMore) {
        const URL_NEW = "https://services.leadconnectorhq.com/forms/submissions";
        const url = `https://rest.gohighlevel.com/v1/forms/submissions?page=${page}&limit=${limit}&formId=${formId}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY_ATOLON_SKY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(response.data)

            const submissions = response.data.submissions || [];

            allSubmissions = allSubmissions.concat(submissions);

            if (submissions.length < limit) {
                hasMore = false;
            } else {
                page++;
            }

        } catch (error) {
            console.error(`Error obteniendo submissions del formId ${formId} página ${page}:`, error.message);
            throw error;
        }
    }

    return allSubmissions;
};

const getFormAllSubmissionsByExperience = async (req, res, next) => {
    const formExperience = process.env.FORM_EXPERIENCE;
    //const formThreeId = process.env.FORM_THREE_ID; // Traditional
    const limit = 100;
    

    if (!formExperience) {
        return res.status(400).json({ error: 'FORM_ID son requeridos en las variables de entorno' });
    }

    //console.log(req.body)

    try {
        // Obtener todos los submissions de ambos formularios
        const [formExperienceSubmissions] = await Promise.all([
            getSubmissions(formExperience, limit),
        ]);

        // Combinar todas las submissions
        req.body.submissions = [
            ...formExperienceSubmissions,
        ];
        console.log(req.body.submissions, "SUBMITIONS")
        next();

    } catch (error) {
        console.error('Error al obtener los datos de los formularios:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al obtener los datos',
            details: error.response?.data || error.message
        });
    }
};

module.exports = getFormAllSubmissionsByExperience;
