const validateDateMatchesSecond = async (req, res, next) => {
  const { dateStart, submissions, numberPerson, hourOnBoarding } = req.body;
  // Ejemplo: dateStart="2025-11-12", dateEnd="2025-11-19" roomName="cabana-1"
  console.log("Los datos son: ", req.body)

  if (!dateStart) {
    return res.status(400).json({ error: "Las fechas de inicio y fin son requeridas" });
  }

  if (!numberPerson) {
    return res.status(400).json({ error: "El numero de personas es requerido" });
  }

    if (!hourOnBoarding) {
    return res.status(400).json({ error: "La hora de embarque es requerido" });
  }

  try {
    const submissionsData = submissions || [];
    console.log(submissionsData.length, "Cantidad de Registros");
    let totalAdditionalPeople = 0;
    let totalHourOnBoardingOfBookings = 0;

    submissionsData.forEach((submission) => {
      const hourOnBoardingMain = submission['JLIXjQ69qYsxnDpwKHcP'];
      const dateStartSubmission = submission['VxRYImDnl8ikmYom7hfz'];
      const personasAdults = Number(submission["aFT17gx5ceNFsSriw5Sd"] || 0);
      const total = personasAdults || 1;

            // 🔹 Solo acumular personas si coinciden fecha
      if (dateStartSubmission === dateStart) {
        totalAdditionalPeople += total;

        // Despues de que coincida en la fecha, en los customValues vienen nombres como los siguientes: disponibilidad-horario830 que corresponde a 8: 30 AM, disponibilidad-horario10 que corresponde a las 10: 00 AM y disponibilidad-horario11 que correspinde a las 11: 00 AM.
        // Cada customValue vendra con un valor numerico.
        // Primero se debe comprobar los que coincidad con el de 8: 30 AM que seria: disponibilidad-horario830.
        // Se debe sumar totalHourOnBoardingOfBookings con este numero: personasAdults, cada vez que coincida.
        // Se debe verificar que totalHourOnBoardingOfBookings no sea mayor al valor del customValue; disponibilidad-horario830.
        // En caso de que sea mayor eso indica que que ya no hay cupos para las (8: 30 AM).
        // Por ende tendria que ir al otro horario: disponibilidad-horario10 (10: 00 AM) y asi sucesivamente con todos.
        // En caso de que todos esten llenos, deberias responder:       return res.json({
       // msg: `No hay cupos suficientes`,
        // ava: false,
        // fechasNoDisponibles: noAvailableDates,
        // });
      }

    })

    // 🔹 Recorremos cada día del rango solicitado
    for (const fecha of dateRange) {
      const numberAvailable =
        availabilityMap?.[aliasKey]?.[fecha] ??
        availabilityMap?.["general"]?.dailyRoomLimit ??
        0;

      console.log(`🛏️ Habitación: ${aliasKey} | Fecha: ${fecha} | Cupos disponibles: ${numberAvailable}`);

      let totalAdditionalPeople = 0;

      submissions?.forEach((submission) => {
        //const nameRoomSubmission = submission['NsBS7YYDop4ZecfJkXbi'];
        const dateStartSubmission = submission['VxRYImDnl8ikmYom7hfz'];
        //const dateEndSubmission = submission['Ff3ikC72CFS1SiDdMjpd'];
        const personasAdults = Number(submission["aFT17gx5ceNFsSriw5Sd"] || 0);
        const total = personasAdults || 1;
        //const normalizedSubmissionRoom = normalizeRoomName(nameRoomSubmission);

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