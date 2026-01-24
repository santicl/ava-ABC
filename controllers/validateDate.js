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

  const normalizeSubmissionHour = (hourString) => {
    if (!hourString) return null;

    const clean = hourString
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace('am', '');

    let [hour, minutes] = clean.split(':');
    if (!hour || !minutes) return null;

    hour = String(Number(hour)); // 🔥 clave

    return `${hour}:${minutes}`;
  };

  const HOURS = [
    { key: 'disponibilidad-horario830', label: '08:30 AM' },
    { key: 'disponibilidad-horario10',  label: '10:00 AM' },
    { key: 'disponibilidad-horario11',  label: '11:00 AM' }
  ];

  const HOUR_KEY_MAP = {
    '8:30': 'disponibilidad-horario830',
    '10:00': 'disponibilidad-horario10',
    '11:00': 'disponibilidad-horario11'
  };

  // 1️⃣ Capacidades
  const capacityMap = {};
  customValues.forEach(cv => {
    if (cv.name && cv.value) {
      capacityMap[cv.name] = Number(cv.value);
    }
  });

  // 2️⃣ Inicializar reservas
  const reservedByHour = {};
  HOURS.forEach(h => reservedByHour[h.key] = 0);

  // 3️⃣ Acumular reservas
  submissions.forEach(submission => {
    const submissionDate = submission['VxRYImDnl8ikmYom7hfz'];
    const hourLabel = submission['JLIXjQ69qYsxnDpwKHcP'];
    const persons = Number(submission['aFT17gx5ceNFsSriw5Sd'] || 1);

    const normalizedHour = normalizeSubmissionHour(hourLabel);
    const hourKey = HOUR_KEY_MAP[normalizedHour];

    if (submissionDate === fecha && hourKey) {
      reservedByHour[hourKey] += persons;
    }
  });

  // 4️⃣ Horarios disponibles
  const availableHours = HOURS.map(hour => {
    const capacity = capacityMap[hour.key] || 0;
    const reserved = reservedByHour[hour.key];
    const available = capacity - reserved;

    return {
      horario: hour.label,
      horarioKey: hour.key,
      capacidad: capacity,
      reservadas: reserved,
      disponibles: Math.max(available, 0),
      disponible: available >= numberPerson
    };
  }).filter(h => h.disponible);

  return res.json({
    ava: availableHours.length > 0,
    date: fecha,
    numberPerson,
    horariosDisponibles: availableHours
  });
};

module.exports = validateAvailabilityByDateAndHour;
