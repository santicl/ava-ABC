const validateDateMatches = async (req, res, next) => {
  const { fecha, submissions, numberPerson, placesAvailable, roomName } = req.body;

  const numberAvailable = placesAvailable;
  console.log(numberAvailable, "validateDATE");

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es requerida" });
  }

  const roomsHotelName = {
    "Doble Standard 2 PAX": 2,
    "Twins #1 - 3 PAX": 3,
    "Twins #2 - 4 PAX": 4,
    "Cabaña #1 - 2 PAX": 2,
    "Cabaña #2 - 2 PAX": 2,
  };

  if ((!submissions || submissions.length === 0) && numberAvailable > 0) {
    return res.json({
      msg: "Hay Cupos Suficientes",
      ava: true,
      avaNumber: numberAvailable,
    });
  }

  try {
    const submissionsData = submissions || [];
    console.log(submissionsData.length, "Cantidad de Registros");

    let totalAdditionalPeople = 0;
    let roomOccupied = false;

    submissionsData.forEach((submission) => {
      const submissionDate = submission["VxRYImDnl8ikmYom7hfz"];
      const submissionRoomName = submission["name"];
      const personasAdults = Number(submission["bMeS4BNHinzH1R2RYbRm"] || 0);
      let total = personasAdults || 1;

      // 🔹 Si coincide fecha y habitación exacta => ya está reservada
      if (submissionDate === fecha && submissionRoomName === roomName) {
        roomOccupied = true;
      }

      // 🔹 Solo acumular personas si coinciden fecha y habitación
      if (submissionDate === fecha && submissionRoomName === roomName) {
        totalAdditionalPeople += total;
      }
    });

    // 🔸 Si la habitación ya está ocupada completamente
    if (roomOccupied) {
      const availablePlaces = numberAvailable - totalAdditionalPeople;

      if (availablePlaces <= 0) {
        return res.json({
          msg: `La habitación "${roomName}" ya está reservada para la fecha ${fecha}`,
          ava: false,
          avaNumber: 0,
        });
      }
    }

    const availablePlaces = numberAvailable - totalAdditionalPeople;
    const avaNumber = availablePlaces;

    console.log("availablePlaces:", availablePlaces);

    if (numberPerson > availablePlaces) {
      return res.json({
        msg: "No hay Cupos Suficientes",
        ava: false,
        avaNumber,
      });
    }

    if (availablePlaces > 0) {
      return res.json({
        msg: "Hay Cupos Suficientes",
        ava: true,
        avaNumber,
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
