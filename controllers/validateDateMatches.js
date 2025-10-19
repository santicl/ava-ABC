const validateDateMatches = async (req, res, next) => {
  const { fecha, submissions, numberPerson, placesAvailable, roomName } = req.body;

  const numberAvailable = placesAvailable;
  console.log(numberAvailable, "validateDATE");

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es requerida" });
  }

  // 🔹 Definimos las habitaciones del hotel y sus cupos
  const roomsHotelName = {
    "Doble Standard 2 PAX": 2,
    "Twins #1 - 3 PAX": 3,
    "Twins #2 - 4 PAX": 4,
    "Cabaña #1 - 2 PAX": 2,
    "Cabaña #2 - 2 PAX": 2,
  };

  // Si no hay reservas y hay cupos, se permite
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
    let roomOccupied = false; // 🔸 Para saber si la habitación ya está ocupada ese día

    submissionsData.forEach((submission) => {
      const submissionDate = submission["VxRYImDnl8ikmYom7hfz"];
      const submissionRoomName = submission["name"];
      const personasAdults = Number(submission["bMeS4BNHinzH1R2RYbRm"] || 0);
      let total = personasAdults;

      if (total === 0) total = 1; // si no registró personas, asumimos 1

      // 🔹 Si coincide fecha y habitación => ya está reservada
      if (submissionDate === fecha && submissionRoomName === roomName) {
        roomOccupied = true;
      }

      // 🔹 Acumulamos solo si coincide fecha
      if (submissionDate === fecha) {
        totalAdditionalPeople += total;
      }
    });

    // 🔸 Si la habitación ya está ocupada, no hay disponibilidad
    if (roomOccupied) {
      return res.json({
        msg: `La habitación "${roomName}" ya está reservada para la fecha ${fecha}`,
        ava: false,
        avaNumber: 0,
      });
    }

    // 🔸 Validación general de cupos
    const availablePlaces = numberAvailable - totalAdditionalPeople;
    const avaNumber = availablePlaces;

    console.log(availablePlaces, avaNumber);

    // No hay cupos suficientes
    if (numberPerson > availablePlaces) {
      return res.json({
        msg: "No hay Cupos Suficientes",
        ava: false,
        avaNumber,
      });
    }

    // Hay cupos
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
    res
      .status(error.response?.status || 500)
      .json({
        error: "Error al validar las fechas",
        details: error.response?.data,
      });
  }
};

module.exports = validateDateMatches;
