const LOGIN_USER = "LINEA079";
const LOGIN_PASS = "ABOGADO079";
const PASS_GRADE = 7;

const $ = (id) => document.getElementById(id);

const state = {
  loggedIn: false,
  candidate: null,
  sectionIndex: 0,
  sectionScores: {
    juridico: null,
    ortografia: null,
    habilidades: null,
    escucha: null
  },
  completed: false,
  approved: false,
  stoppedAt: null,
  sent: false
};

const sections = [
  {
    id: "juridico",
    title: "1. Jurídico",
    type: "quiz",
    pointsPerQuestion: 1,
    passGrade: PASS_GRADE,
    questions: [
      { text: "¿Cuál es el inciso correcto para la definición de norma jurídica?", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "¿Qué inciso corresponde a la jerarquía normativa?", options: ["A", "B", "C", "D"], answer: "B" },
      { text: "¿Cuál inciso representa una obligación legal?", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "Seleccione el inciso correcto sobre debido proceso.", options: ["A", "B", "C", "D"], answer: "D" },
      { text: "¿Cuál inciso corresponde al principio de legalidad?", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "¿Qué inciso describe mejor la seguridad jurídica?", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "Seleccione el inciso sobre tipicidad.", options: ["A", "B", "C", "D"], answer: "B" },
      { text: "¿Cuál inciso corresponde al principio pro persona?", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "¿Qué inciso define una sanción administrativa?", options: ["A", "B", "C", "D"], answer: "D" },
      { text: "Seleccione el inciso correcto sobre competencia de autoridad.", options: ["A", "B", "C", "D"], answer: "B" }
    ]
  },
  {
    id: "ortografia",
    title: "2. Ortografía",
    type: "quiz",
    pointsPerQuestion: 1,
    passGrade: PASS_GRADE,
    questions: [
      { text: "Seleccione el inciso con acentuación correcta.", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "¿Cuál inciso usa correctamente las mayúsculas?", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "Seleccione el inciso con puntuación adecuada.", options: ["A", "B", "C", "D"], answer: "B" },
      { text: "¿Cuál inciso escribe correctamente los monosílabos?", options: ["A", "B", "C", "D"], answer: "D" },
      { text: "Seleccione el inciso con uso correcto de b/v.", options: ["A", "B", "C", "D"], answer: "B" },
      { text: "¿Cuál inciso usa correctamente g/j?", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "Seleccione el inciso con uso correcto de h.", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "¿Qué inciso aplica correctamente la coma?", options: ["A", "B", "C", "D"], answer: "D" },
      { text: "Seleccione el inciso con concordancia correcta.", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "¿Cuál inciso presenta redacción ortográfica correcta?", options: ["A", "B", "C", "D"], answer: "A" }
    ]
  },
  {
    id: "habilidades",
    title: "3. Habilidades digitales",
    type: "quiz",
    pointsPerQuestion: 2,
    passGrade: PASS_GRADE,
    questions: [
      { text: "¿Qué inciso indica una práctica segura de contraseñas?", options: ["A", "B", "C", "D"], answer: "B" },
      { text: "Seleccione el inciso sobre uso correcto de correo institucional.", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "¿Cuál inciso describe un respaldo adecuado de archivos?", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "Seleccione el inciso sobre protección de datos personales.", options: ["A", "B", "C", "D"], answer: "D" },
      { text: "¿Qué inciso representa el uso eficiente de herramientas colaborativas?", options: ["A", "B", "C", "D"], answer: "B" }
    ]
  },
  {
    id: "escucha",
    title: "4. Escucha activa",
    type: "quiz",
    pointsPerQuestion: 2,
    passGrade: PASS_GRADE,
    questions: [
      { text: "Seleccione el inciso que refleja parafraseo correcto.", options: ["A", "B", "C", "D"], answer: "A" },
      { text: "¿Qué inciso demuestra validación emocional adecuada?", options: ["A", "B", "C", "D"], answer: "C" },
      { text: "Seleccione el inciso con pregunta de aclaración efectiva.", options: ["A", "B", "C", "D"], answer: "B" },
      { text: "¿Cuál inciso muestra escucha sin interrupciones?", options: ["A", "B", "C", "D"], answer: "D" },
      { text: "Seleccione el inciso que evidencia seguimiento empático.", options: ["A", "B", "C", "D"], answer: "A" }
    ]
  },
  {
    id: "redaccion",
    title: "5. Instrucciones de redacción",
    type: "instructions",
    content: `
      <div class="block">
        <p><strong>Indicaciones:</strong></p>
        <ul>
          <li>Redacte en español formal y con acentos correctos.</li>
          <li>Use frases claras, precisas y sin ambigüedad.</li>
          <li>Evite abreviaturas informales.</li>
          <li>Revise ortografía y puntuación antes de entregar.</li>
        </ul>
      </div>
    `
  },
  {
    id: "test5",
    title: "6. Test de los 5 minutos",
    type: "instructions",
    content: `
      <div class="block">
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>Lea el caso práctico completo.</li>
          <li>Organice sus ideas por prioridad.</li>
          <li>Responda en máximo cinco minutos.</li>
          <li>Enfoque la solución en claridad, legalidad y trato humano.</li>
        </ol>
      </div>
    `
  }
];

function setMsg(id, text, type = "") {
  const el = $(id);
  el.textContent = text;
  el.className = `msg ${type}`.trim();
}

function clearMsgs() {
  ["loginMsg", "candidateMsg", "examMsg", "sendMsg"].forEach((id) => setMsg(id, ""));
}

function show(id, visible = true) {
  $(id).classList.toggle("hidden", !visible);
}

function normalizeUpperName(name) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function resetExamState() {
  state.sectionIndex = 0;
  state.sectionScores = { juridico: null, ortografia: null, habilidades: null, escucha: null };
  state.completed = false;
  state.approved = false;
  state.stoppedAt = null;
  state.sent = false;
}

function calculateQuizGrade(section, answers) {
  const max = section.questions.length * section.pointsPerQuestion;
  let score = 0;
  section.questions.forEach((q, idx) => {
    if (answers[idx] === q.answer) score += section.pointsPerQuestion;
  });
  const grade = (score / max) * 10;
  return { score, max, grade };
}

function getAverage() {
  const scores = Object.values(state.sectionScores).filter((v) => typeof v === "number");
  if (!scores.length) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return sum / scores.length;
}

function renderSection() {
  clearMsgs();
  const section = sections[state.sectionIndex];
  if (!section) return;

  $("examTitle").textContent = section.title;
  $("progressText").textContent = `Sección ${state.sectionIndex + 1} de ${sections.length}`;

  if (section.type === "quiz") {
    const questionsHtml = section.questions
      .map((q, idx) => {
        const options = q.options
          .map(
            (op) => `
              <label>
                <input type="radio" name="q${idx}" value="${op}" required />
                ${op}
              </label>`
          )
          .join("");

        return `
          <div class="question">
            <p>${idx + 1}. ${q.text}</p>
            <div class="options">${options}</div>
          </div>
        `;
      })
      .join("");

    $("examBody").innerHTML = `
      <form id="quizForm">
        ${questionsHtml}
        <button class="btn primary" type="submit">Calificar sección</button>
      </form>
    `;

    $("quizForm").addEventListener("submit", handleQuizSubmit);
    return;
  }

  $("examBody").innerHTML = `
    ${section.content}
    <button class="btn primary" id="nextInstructionBtn" type="button">Continuar</button>
  `;
  $("nextInstructionBtn").addEventListener("click", goToNextSection);
}

function handleQuizSubmit(event) {
  event.preventDefault();

  const section = sections[state.sectionIndex];
  const answers = section.questions.map((_, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    return selected?.value || "";
  });

  if (answers.some((a) => !a)) {
    setMsg("examMsg", "Debe responder todas las preguntas antes de calificar.", "error");
    return;
  }

  const result = calculateQuizGrade(section, answers);
  state.sectionScores[section.id] = Number(result.grade.toFixed(2));

  if (result.grade >= section.passGrade) {
    setMsg("examMsg", "¡Continúas a la siguiente sección!", "ok");
    setTimeout(goToNextSection, 700);
    return;
  }

  state.completed = true;
  state.approved = false;
  state.stoppedAt = section.title;
  finishProcess();
}

function goToNextSection() {
  state.sectionIndex += 1;
  if (state.sectionIndex >= sections.length) {
    state.completed = true;
    state.approved = true;
    finishProcess();
    return;
  }
  renderSection();
}

function finishProcess() {
  show("examSection", false);
  show("resultSection", true);

  const avg = getAverage();
  const formattedAvg = avg.toFixed(2);
  const scoreLines = [
    ["Jurídico", state.sectionScores.juridico],
    ["Ortografía", state.sectionScores.ortografia],
    ["Habilidades Digitales", state.sectionScores.habilidades],
    ["Escucha Activa", state.sectionScores.escucha]
  ];

  const scoreHtml = scoreLines
    .map(([name, value]) => `<li><strong>${name}:</strong> ${value ?? "No presentado"}</li>`)
    .join("");

  const status = state.approved ? "APROBADO" : "REPROBADO";
  const message = state.approved
    ? `¡Tu promedio es de ${formattedAvg}!`
    : `¡Gracias por tu participación! Puntaje obtenido: ${formattedAvg}`;

  $("resultBox").innerHTML = `
    <div class="summary">
      <p><strong>${message}</strong></p>
      <ul>${scoreHtml}</ul>
      <p><strong>Estatus:</strong> ${status}</p>
      ${state.stoppedAt ? `<p><strong>Proceso detenido en:</strong> ${state.stoppedAt}</p>` : ""}
    </div>
  `;
}

function getReportPayload() {
  const avg = Number(getAverage().toFixed(2));
  const status = state.approved ? "APROBADO" : "REPROBADO";
  return {
    candidate: state.candidate,
    scores: { ...state.sectionScores },
    average: avg,
    status,
    stoppedAt: state.stoppedAt || "Finalizado"
  };
}

async function sendReport() {
  if (state.sent) {
    setMsg("sendMsg", "El reporte ya fue enviado en esta evaluación.", "ok");
    return;
  }

  setMsg("sendMsg", "Enviando reporte a Telegram...");
  try {
    const response = await fetch("/api/send-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getReportPayload())
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo enviar el reporte.");
    }

    state.sent = true;
    setMsg("sendMsg", "Reporte enviado correctamente al grupo.", "ok");
  } catch (error) {
    setMsg("sendMsg", `Error al enviar reporte: ${error.message}`, "error");
  }
}

function handleLogin(event) {
  event.preventDefault();
  clearMsgs();

  const user = $("loginUser").value.trim();
  const pass = $("loginPass").value.trim();

  if (user !== LOGIN_USER || pass !== LOGIN_PASS) {
    setMsg("loginMsg", "Usuario o contraseña incorrectos.", "error");
    return;
  }

  state.loggedIn = true;
  show("loginSection", false);
  show("candidateSection", true);
  setMsg("candidateMsg", "Sesión iniciada. Capture los datos del aspirante.", "ok");
}

function handleCandidate(event) {
  event.preventDefault();
  clearMsgs();

  const fullName = normalizeUpperName($("fullName").value);
  const titleId = $("titleId").value.trim();
  const university = $("university").value.trim();

  if (!fullName || !titleId || !university) {
    setMsg("candidateMsg", "Todos los datos son obligatorios.", "error");
    return;
  }

  if (fullName !== fullName.toUpperCase()) {
    setMsg("candidateMsg", "El nombre debe registrarse en mayúsculas.", "error");
    return;
  }

  state.candidate = { fullName, titleId, university };
  sessionStorage.setItem("candidate", JSON.stringify(state.candidate));

  resetExamState();
  show("candidateSection", false);
  show("examSection", true);
  renderSection();
}

function newCandidate() {
  state.candidate = null;
  sessionStorage.removeItem("candidate");
  resetExamState();

  $("candidateForm").reset();
  show("resultSection", false);
  show("candidateSection", true);
  setMsg("candidateMsg", "Capture los datos del siguiente aspirante.", "ok");
}

function logout() {
  state.loggedIn = false;
  state.candidate = null;
  resetExamState();
  sessionStorage.clear();

  $("loginForm").reset();
  $("candidateForm").reset();

  show("candidateSection", false);
  show("examSection", false);
  show("resultSection", false);
  show("loginSection", true);

  clearMsgs();
  setMsg("loginMsg", "Sesión cerrada correctamente.", "ok");
}

function init() {
  $("loginForm").addEventListener("submit", handleLogin);
  $("candidateForm").addEventListener("submit", handleCandidate);
  $("sendBtn").addEventListener("click", sendReport);
  $("newCandidateBtn").addEventListener("click", newCandidate);
  ["logoutTop", "logoutExam", "logoutBottom"].forEach((id) => {
    $(id).addEventListener("click", logout);
  });

  show("candidateSection", false);
  show("examSection", false);
  show("resultSection", false);
}

init();
