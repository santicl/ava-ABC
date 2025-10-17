const validateDateMatches = async (req, res, next) => {
    const { fecha } = req.body;
    const { submissions } = req.body;
    const { numberPerson } = req.body;
    const numberAvailable = req.body.placesAvailable;
    console.log(numberAvailable, "validateDATE")

    if (!fecha) {
        return res.status(400).json({ error: 'La fecha es requerida' });
    }

    //console.log(submissions)

    if (submissions.length === 0 && numberAvailable > 0) {
        return res.json({
            msg: 'Hay Cupos Suficientes',
            ava: true,
            avaNumber: numberAvailable
        });
    }


    try {
        const submissionsData = submissions || [];
        console.log(submissionsData.length, 'Cantidad de Registros')

        let totalAdditionalPeople = 0;

    submissionsData.forEach((submission) => {
      const submissionDate = submission["VxRYImDnl8ikmYom7hfz"];

      const personasAdults = Number(submission["bMeS4BNHinzH1R2RYbRm"] || 0);

      let total = personasAdults

      // Si no se registró nadie, asumimos que mínimo es 1 persona
      if (total === 0) {
        total = 1;
      }

      if (submissionDate === fecha) {
        totalAdditionalPeople += total;
      }
    });


        // Cantidad de personas total
        const availablePlaces = numberAvailable - totalAdditionalPeople;
        const avaNumber = numberAvailable - totalAdditionalPeople;
        console.log(availablePlaces, avaNumber)

        // Cupos a solicitar es mayor a cupos disponibles
        if (numberPerson > availablePlaces) {
            return res.json({
                msg: 'No hay Cupos Suficientes',
                ava: false,
                avaNumber: avaNumber
            });
        }

        // Colocar disponibilidad para una siguiente fecha mas cercana o en el formulario colocar mensaje al usuario de buscar disponibilidad para otras fechas

        // Cupos suficientes
        if (availablePlaces <= numberAvailable) {
            return res.json({
                msg: 'Hay Cupos Suficientes',
                ava: true,
                avaNumber: avaNumber
            });
        }

        return res.json({
            msg: 'No se pudo validar',
            ava: false,
            avaNumber: avaNumber
        });

    } catch (error) {
        console.error('Error al validar las fechas:', error);
        res.status(error.response?.status || 500).json({ error: 'Error al validar las fechas', details: error.response?.data });
    }
};

module.exports = validateDateMatches;
