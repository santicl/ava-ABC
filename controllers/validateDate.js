const validateAvailabilityByDateAndHour = async (req, res) => {
  const { fecha, submissions, customValues, numberPerson = 1 } = req.body;

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es requerida" });
  }

  if (!Array.isArray(submissions)) {
    return res.status(400).json({ error: "Submissions inválidas" });
  }

  if (!Array.isArray(customValues)) {
    return res.status(400).json({ error: "customValues inválidos" });
  }

  const getHourKeyFromSubmission = (hourString) => {
  if (!hourString) return null;

  // '8: 30 AM' → '8:30'
  const clean = hourString
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('am', '');

  const [hour, minutes] = clean.split(':');

  if (!hour || !minutes) return null;

  return `disponibilidad-horario${hour}${minutes}`;
};

  // 🔹 4. Normalizar valor del submission (USA SOLO ESTE FORMATO)
  const normalizeSubmissionHour = (hourString) => {
    if (!hourString) return null;

    return hourString
      .toLowerCase()
      .replace(/\s+/g, '') // quita espacios
      .replace('am', '');  // elimina AM
  };

  const HOURS = [
    { key: 'disponibilidad-horario830', label: '08:30 AM' },
    { key: 'disponibilidad-horario10',  label: '10:00 AM' },
    { key: 'disponibilidad-horario11',  label: '11:00 AM' }
  ];

    // 🔹 3. Mapa explícito hora lógica → key GHL
  const HOUR_KEY_MAP = {
    '8:30': 'disponibilidad-horario830',
    '10:00': 'disponibilidad-horario10',
    '11:00': 'disponibilidad-horario11'
  };

  // 🔹 1. Crear mapa de capacidades desde customValues
  const capacityMap = {};
  customValues.forEach(cv => {
    if (cv.name && cv.value) {
      capacityMap[cv.name] = Number(cv.value);
    }
  });

  // 🔹 2. Inicializar contador por horario (SIEMPRE por KEY)
  const reservedByHour = {};
  HOURS.forEach(h => reservedByHour[h.key] = 0);

  // 🔹 3. Crear mapa LABEL → KEY (normalizado)
  const hourLabelToKeyMap = {};
  HOURS.forEach(h => {
    hourLabelToKeyMap[h.label] = h.key;
  });

  // 🔹 4. Acumular personas por horario SOLO para la fecha
  submissions.forEach(submission => {
    const submissionDate = submission['VxRYImDnl8ikmYom7hfz'];
    const hourSelectedLabel = submission['JLIXjQ69qYsxnDpwKHcP'];
    const persons = Number(submission['aFT17gx5ceNFsSriw5Sd'] || 1);

    // Normalizar label (quita espacios raros)

    const normalizedHour = normalizeSubmissionHour(hourSelectedLabel);
    const hourKey = HOUR_KEY_MAP[normalizedHour];

    if (
      submissionDate === fecha &&
      hourKey &&
      reservedByHour[hourKey] !== undefined
    ) {
      reservedByHour[hourKey] += persons;
    }
  });

  // 🔹 5. Buscar el primer horario disponible
  for (const hour of HOURS) {
    const capacity = capacityMap[hour.key] || 0;
    const reserved = reservedByHour[hour.key];
    const available = capacity - reserved;

    if (available >= numberPerson) {
      return res.json({
        ava: true,
        date: fecha,
        horario: hour.label,
        horarioKey: hour.key,
        capacidad: capacity,
        reservadas: reserved,
        disponibles: available
      });
    }
  }

  // 🔹 6. Si todos los horarios están llenos
  return res.json({
    ava: false,
    msg: "No hay cupos suficientes",
    date: fecha,
    detalleHorarios: HOURS.map(h => {
      const cap = capacityMap[h.key] || 0;
      const resv = reservedByHour[h.key];
      return {
        horario: h.label,
        capacidad: cap,
        reservadas: resv,
        disponibles: Math.max(cap - resv, 0)
      };
    })
  });
};

module.exports = validateAvailabilityByDateAndHour;
