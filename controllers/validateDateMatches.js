const validateDateMatches = async (req, res, next) => {
  const { fecha, submissions, numberPerson, placesAvailable, roomName } = req.body;

  const numberAvailable = placesAvailable;
  console.log(numberAvailable, "validateDATE");

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es requerida" });
  }

  if ((!submissions || submissions.length === 0) && numberAvailable > 0) {
    return res.json({
      msg: "Hay Cupos Suficientes",
      ava: true,
      avaNumber: numberAvailable,
      res: "Prueba de que pasa por aqui"
    });
  }

  if (numberAvailable === 0) {
    return res.json({
      msg: "No hay Cupos Suficientes",
      ava: false,
      avaNumber: numberAvailable,
      res: "Prueba de que pasa por aqui: numberAvailable === 0"
    });
  }

  try {
    const submissionsData = submissions || [];
    console.log(submissionsData.length, "Cantidad de Registros");

    let totalAdditionalPeople = 0;
    let roomOccupied = false;

    submissionsData.forEach((submission) => {
      const submissionDate = submission['VxRYImDnl8ikmYom7hfz'];
      const personasAdults = Number(submission["aFT17gx5ceNFsSriw5Sd"] || 0);
      let total = personasAdults || 1;

      // 🔹 Solo acumular personas si coinciden fecha y habitación
      if (submissionDate === fecha) {
        totalAdditionalPeople += total;
      }
    });

    const availablePlaces = numberAvailable - totalAdditionalPeople;
    const avaNumber = availablePlaces;

    console.log("availablePlaces:", availablePlaces);

    if (numberPerson > availablePlaces) {
      return res.json({
        msg: "No hay Cupos Suficientes",
        ava: false,
        avaNumber,
        res: "Prueba de que pasa por aqui: numberPerson > availablePlaces"
      });
    }

    if (availablePlaces > 0) {
      return res.json({
        msg: "Hay Cupos Suficientes",
        ava: true,
        avaNumber,
        res: "Prueba de que pasa por aqui: availablePlaces > 0"
      });
    }

    return res.json({
      msg: "No se pudo validar disponibilidad",
      ava: false,
      avaNumber,
    });
  } catch (error) {
    console.error("Error al validar las fechas:", error);
    res.status(error.response?.status || 500).json({
      error: "Error al validar las fechas",
      details: error.response?.data,
    });
  }
};

module.exports = validateDateMatches;
