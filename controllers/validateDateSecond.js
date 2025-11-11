const validateDateMatchesSecond = async (req, res, next) => {
  const { dateStart, dateEnd, submissions, numberPerson, availabilityMap, roomName } = req.body; 
  // Ejemplo: dateStart="2025-11-12", dateEnd="2025-11-19" roomName="cabana-1"

  if (!dateStart || !dateEnd) {
    return res.status(400).json({ error: "Las fechas de inicio y fin son requeridas" });
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

  function normalizeRoomName(roomName) {
    if (!roomName) return '';
    return roomName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/#/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^([a-z0-9-]*?[0-9]).*$/, '$1')
      .replace(/-+/g, '-')
      .replace(/-$/, '');
  }

  const normalizedRoom = normalizeRoomName(roomName);
  const aliasKey = roomAliasMap[normalizedRoom] || normalizedRoom;

  // 🔹 Generar rango de fechas entre dateStart y dateEnd
  const getDateRange = (start, end) => {
    const range = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      range.push(current.toISOString().split("T")[0]); // formato YYYY-MM-DD
      current.setDate(current.getDate() + 1);
    }
    return range;
  };

  const dateRange = getDateRange(dateStart, dateEnd);

  if (!availabilityMap) {
    return res.status(400).json({ error: "El mapa de disponibilidad es requerido" });
  }

  try {
    const noAvailableDates = []; // 🔸 Fechas sin disponibilidad

    // 🔹 Recorremos cada día del rango solicitado
    for (const fecha of dateRange) {
      const numberAvailable =
        availabilityMap?.[aliasKey]?.[fecha] ??
        availabilityMap?.["general"]?.dailyRoomLimit ??
        0;

      console.log(`🛏️ Habitación: ${aliasKey} | Fecha: ${fecha} | Cupos disponibles: ${numberAvailable}`);

      let totalAdditionalPeople = 0;

      submissions?.forEach((submission) => {
        const nameRoomSubmission = submission['NsBS7YYDop4ZecfJkXbi'];
        const dateStartSubmission = submission['VxRYImDnl8ikmYom7hfz'];
        const dateEndSubmission = submission['Ff3ikC72CFS1SiDdMjpd'];
        const personasAdults = Number(submission["bMeS4BNHinzH1R2RYbRm"] || 0);
        const total = personasAdults || 1;
        const normalizedSubmissionRoom = normalizeRoomName(nameRoomSubmission);

        // 🔹 Verificar solapamiento de fechas
        const overlap =
          normalizedSubmissionRoom === normalizedRoom &&
          new Date(fecha) >= new Date(dateStartSubmission) &&
          new Date(fecha) <= new Date(dateEndSubmission);

        if (overlap) totalAdditionalPeople += total;
      });

      const availablePlaces = numberAvailable - totalAdditionalPeople;
      const avaNumber = Math.max(availablePlaces, 0);

      console.log(`📅 ${fecha} → Reservadas: ${totalAdditionalPeople}, Disponibles: ${avaNumber}`);

      // 🔹 Si no hay cupos o las personas exceden los cupos, marcar como no disponible
      if (avaNumber <= 0 || numberPerson > avaNumber) {
        noAvailableDates.push({
          fecha,
          disponibles: avaNumber,
          reservadas: totalAdditionalPeople,
          capacidad: numberAvailable
        });
      }
    }

    // 🔹 Si hay fechas no disponibles
    if (noAvailableDates.length > 0) {
      const listaFechas = noAvailableDates.map(d => d.fecha).join(", ");
      return res.json({
        msg: `No hay cupos suficientes para esta habitación en las siguientes fechas: ${listaFechas}`,
        ava: false,
        fechasNoDisponibles: noAvailableDates,
      });
    }

    // 🔹 Si todas las fechas del rango tienen cupos suficientes
    return res.json({
      msg: "Hay cupos suficientes para todo el rango de fechas",
      ava: true,
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