const validateDateMatches = async (req, res) => {
  const { fecha, submissions = [], numberPerson, placesAvailable } = req.body;

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es requerida" });
  }

  if (!numberPerson || numberPerson <= 0) {
    return res.status(400).json({ error: "Número de personas inválido" });
  }

  // Capacidad total real
  const totalCapacity = Number(placesAvailable) || 0;

  if (totalCapacity <= 0) {
    return res.json({
      msg: "No hay Cupos Suficientes",
      ava: false,
      avaNumber: 0
    });
  }

  // Personas ya reservadas en esa fecha
  let totalReserved = 0;

  submissions.forEach(submission => {
    const submissionDate = submission['VxRYImDnl8ikmYom7hfz'];
    const adults = Number(submission["aFT17gx5ceNFsSriw5Sd"] || 0);

    if (submissionDate === fecha) {
      totalReserved += adults;
    }
  });

  const availablePlaces = totalCapacity - totalReserved;

  if (availablePlaces <= 0) {
    return res.json({
      msg: "No hay Cupos Suficientes",
      ava: false,
      avaNumber: 0
    });
  }

  if (numberPerson > availablePlaces) {
    return res.json({
      msg: "No hay Cupos Suficientes",
      ava: false,
      avaNumber: availablePlaces
    });
  }

  return res.json({
    msg: "Hay Cupos Suficientes",
    ava: true,
    avaNumber: availablePlaces
  });
};

module.exports = validateDateMatches;
