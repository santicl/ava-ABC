const axios = require("axios");

// Función reutilizable para obtener submissions paginados
const getSubmissions = async (formId, limit = 100) => {
    let page = 1;
    let allSubmissions = [];
    let hasMore = true;

    while (hasMore) {
        const url = `https://rest.gohighlevel.com/v1/forms/submissions?page=${page}&limit=${limit}&formId=${formId}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY_PALMARITO}`,
                    'Content-Type': 'application/json'
                }
            });

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

const getFormAllByIdSubmissions = async (req, res, next) => {
    const formHabFamiliar = process.env.HAB_FAMILIAR
    const formTwins1 = process.env.TWINS_1
    const formTwins2 = process.env.TWINS_2
    const formCabana1 = process.env.CABANA
    const formCabana2 = process.env.CABANA_2
    const dobleStandard = process.env.DOBLE_STANDARD
    //const formThreeId = process.env.FORM_THREE_ID; // Traditional
    const limit = 100;
    

    if (!formHabFamiliar) {
        return res.status(400).json({ error: 'FORM_ID son requeridos en las variables de entorno' });
    }

    //console.log(req.body)

    try {
        // Obtener todos los submissions de ambos formularios
        const [formTwins1Submissions, formHabFamiliarSubmissions, formTwins2Submisions, formCabana1Submisions, formCabana2Submisions, formDobleStandardSubmisions] = await Promise.all([
            getSubmissions(formTwins1, limit),
            getSubmissions(formHabFamiliar, limit),
            getSubmissions(formTwins2, limit),
            getSubmissions(formCabana1, limit),
            getSubmissions(formCabana2, limit),
            getSubmissions(dobleStandard, limit),
        ]);

        // Combinar todas las submissions
        req.body.submissions = [
            ...formTwins1Submissions, 
            ...formHabFamiliarSubmissions, 
            ...formTwins2Submisions, 
            ...formCabana1Submisions, 
            ...formCabana2Submisions,
            ...formDobleStandardSubmisions
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

module.exports = getFormAllByIdSubmissions;
