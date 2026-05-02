const validateAvailabilityByDateAndHour = async (req, res) => {
  const { fecha, submissions, customValues, numberPerson = 1, type } = req.body;

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

    hour = String(Number(hour));

    return `${hour}:${minutes}`;
  };

  const HOURS = [
    { key: 'disponibilidad-horario830', label: '08:00 AM' },
    { key: 'disponibilidad-horario10',  label: '10:00 AM' },
    { key: 'disponibilidad-horario11',  label: '11:00 AM' }
  ];

  const HOUR_KEY_MAP = {
    '8:00': 'disponibilidad-horario830',
    '10:00': 'disponibilidad-horario10',
    '11:00': 'disponibilidad-horario11'
  };

  // =========================
  // 1️⃣ MAPAS
  // =========================
  const baseCapacityMap = {};
  const dateCapacityMap = {};
  const typeAvailabilityMap = {};

  customValues.forEach(cv => {
    if (!cv.name || cv.value === undefined) return;

    const value = Number(cv.value);

    console.log("Nombre de Custom Value:", cv.name, "Valor:", value);

    // 🔥 VIP / Exclusive por fecha
    const typeMatch = cv.name.match(/^disponible-(vip|exclusive)-(\d{4}-\d{2}-\d{2})$/);

    if (typeMatch) {
      const [, t, date] = typeMatch;

      if (date === fecha) {
        typeAvailabilityMap[t] = value;
      }
      return;
    }

    // 🔥 Horarios por fecha
    const match = cv.name.match(/^(disponibilidad-horario\d+)-(\d{4}-\d{2}-\d{2})$/);

    if (match) {
      const [, baseKey, date] = match;

      if (date === fecha && dateCapacityMap[baseKey] === undefined) {
        dateCapacityMap[baseKey] = value;
      }
    } else {
      baseCapacityMap[cv.name] = value;
    }
  });

  const typeLimit = type ? typeAvailabilityMap[type] : undefined;

  // =========================
  // 2️⃣ RESERVAS POR HORARIO
  // =========================
  const reservedByHour = {};
  HOURS.forEach(h => reservedByHour[h.key] = 0);

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

  // =========================
  // 3️⃣ DISPONIBILIDAD FINAL
  // =========================
  const availableHours = HOURS.map(hour => {
    const capacity =
      dateCapacityMap[hour.key] ??
      baseCapacityMap[hour.key] ??
      0;

    const reserved = reservedByHour[hour.key];

    let available = capacity - reserved;

    // 🔥 aplicar límite por tipo (VIP / Exclusive)
    if (typeLimit !== undefined) {
      available = Math.min(available, typeLimit);
    }

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
    type,
    numberPerson,
    horariosDisponibles: availableHours
  });
};

module.exports = validateAvailabilityByDateAndHour;