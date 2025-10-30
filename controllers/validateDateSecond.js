const validateDateMatchesSecond = async (req, res, next) => {
  const { fecha, submissions, numberPerson, availabilityMap, roomName } = req.body;
  console.log(availabilityMap)

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es requerida" });
  }

  if (!roomName) {
    return res.status(400).json({ error: "El nombre de la habitación es requerido" });
  }

  const roomAliasMap = {
  "doble-standard-2": "standard-doble",
  "cabana-1": "cabana-1",
  "cabana-2": "cabana-2",
  "hab-familiar": "hab-familiar",
  "twins-1": "twins-1",
  "twins-2": "twins-2"
};


  // Normalizar roomName para buscar en availabilityMap
  // Ejemplo: "Cabaña #1 - 2 PAX" → "cabana-1"
function normalizeRoomName(roomName) {
  if (!roomName) return '';

  return roomName
    .normalize("NFD") // elimina acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina marcas diacríticas
    .replace(/#/g, "") // elimina símbolo #
    .toLowerCase()
    .trim()
    // reemplaza cualquier carácter no alfanumérico por un guion
    .replace(/[^a-z0-9]+/g, '-')
    // captura hasta el primer número y corta el resto
    .replace(/^([a-z0-9-]*?[0-9]).*$/, '$1')
    // limpia guiones duplicados o finales
    .replace(/-+/g, '-')
    .replace(/-$/, '');
}


  const normalizedRoom = normalizeRoomName(roomName);
  const aliasKey = roomAliasMap[normalizedRoom] || normalizedRoom;

  const numberAvailable =
    availabilityMap?.[aliasKey]?.[fecha] ??
    availabilityMap?.["general"]?.dailyRoomLimit ??
    0;

  console.log(`🛏️ Habitación: ${aliasKey} | Fecha: ${fecha} | Cupos disponibles: ${numberAvailable}`);

  if (numberAvailable === 0) {
    return res.json({
      msg: "No hay Cupos Suficientes para esta habitación",
      ava: false,
      avaNumber: 0,
    });
  }

  // Si no hay reservas registradas aún
  if (!submissions || submissions.length === 0) {
    return res.json({
      msg: "Hay Cupos Suficientes",
      ava: true,
      avaNumber: numberAvailable,
    });
  }

  try {
    let totalAdditionalPeople = 0;

    submissions.forEach((submission) => {
      const submissionDate = submission["VxRYImDnl8ikmYom7hfz"];
      const submissionRoomName = submission["name"];
      const personasAdults = Number(submission["bMeS4BNHinzH1R2RYbRm"] || 0);
      const total = personasAdults || 1;

      // Solo acumular personas si coinciden fecha y habitación
      if (submissionDate === fecha && normalizeRoomName(submissionRoomName) === normalizedRoom) {
        totalAdditionalPeople += total;
      }
    });

    const availablePlaces = numberAvailable - totalAdditionalPeople;
    const avaNumber = Math.max(availablePlaces, 0);

    console.log(`👥 Reservadas: ${totalAdditionalPeople}, Disponibles: ${avaNumber}`);

    if (avaNumber <= 0) {
      return res.json({
        msg: `La habitación "${roomName}" ya está completamente reservada para ${fecha}`,
        ava: false,
        avaNumber: 0,
      });
    }

    if (numberPerson > avaNumber) {
      return res.json({
        msg: "No hay Cupos Suficientes",
        ava: false,
        avaNumber,
      });
    }

    return res.json({
      msg: "Hay Cupos Suficientes",
      ava: true,
      avaNumber,
    });
  } catch (error) {
    console.error("❌ Error al validar las fechas:", error);
    res.status(500).json({
      error: "Error al validar las fechas",
      details: error.message,
    });
  }
};

module.exports = validateDateMatchesSecond;
