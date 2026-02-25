function csvEscape(value) {
  const text = `${value ?? ""}`.replaceAll('"', '""');
  return `"${text}"`;
}

function buildCsv(payload) {
  const headers = [
    "Aspirante",
    "Titulo y Cedula",
    "Universidad",
    "Puntaje examen JURIDICO",
    "Puntaje examen ORTOGRAFIA",
    "Puntaje examen HABILIDADES",
    "Puntaje examen ESCUCHA ACTIVA",
    "Puntaje promedio",
    "Estatus",
    "Proceso detenido en"
  ];

  const row = [
    payload.candidate.fullName,
    payload.candidate.titleId,
    payload.candidate.university,
    payload.scores.juridico ?? "No presentado",
    payload.scores.ortografia ?? "No presentado",
    payload.scores.habilidades ?? "No presentado",
    payload.scores.escucha ?? "No presentado",
    payload.average,
    payload.status,
    payload.stoppedAt
  ];

  return `${headers.join(",")}\n${row.map(csvEscape).join(",")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en variables de entorno."
    });
  }

  const payload = req.body;
  if (!payload?.candidate?.fullName) {
    return res.status(400).json({ error: "Datos del candidato incompletos." });
  }

  const message = [
    `Aspirante: ${payload.candidate.fullName}`,
    `Titulo y Cedula: ${payload.candidate.titleId}`,
    `Universidad: ${payload.candidate.university}`,
    `Puntaje examen JURIDICO: ${payload.scores.juridico ?? "No presentado"}`,
    `Puntaje examen ORTOGRAFIA: ${payload.scores.ortografia ?? "No presentado"}`,
    `Puntaje examen HABILIDADES: ${payload.scores.habilidades ?? "No presentado"}`,
    `Puntaje examen ESCUCHA ACTIVA: ${payload.scores.escucha ?? "No presentado"}`,
    `Puntaje promedio: ${payload.average}`,
    `Estatus: ${payload.status}`,
    `Proceso detenido en: ${payload.stoppedAt}`
  ].join("\n");

  const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const sendMessageRes = await fetch(sendMessageUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });

  const sendMessageData = await sendMessageRes.json();
  if (!sendMessageRes.ok || !sendMessageData.ok) {
    return res.status(502).json({ error: "No se pudo enviar el mensaje a Telegram." });
  }

  const csv = buildCsv(payload);
  const csvName = `reporte_${payload.candidate.fullName.replace(/\s+/g, "_")}_${Date.now()}.csv`;

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", `Reporte CSV - ${payload.candidate.fullName}`);
  formData.append("document", new Blob([csv], { type: "text/csv;charset=utf-8" }), csvName);

  const sendDocumentUrl = `https://api.telegram.org/bot${token}/sendDocument`;
  const sendDocRes = await fetch(sendDocumentUrl, {
    method: "POST",
    body: formData
  });

  const sendDocData = await sendDocRes.json();
  if (!sendDocRes.ok || !sendDocData.ok) {
    return res.status(502).json({ error: "Se envió el mensaje, pero falló el adjunto CSV." });
  }

  return res.status(200).json({ ok: true });
}
