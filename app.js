const $ = (id) => document.getElementById(id);

function normalizeStr(s){
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,""); // quita acentos
}

function escapeHTML(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function setStatus(html, isError=false){
  $("status").innerHTML = isError
    ? `<span style="color:#ffb4b4">⚠️ ${html}</span>`
    : `<span>${html}</span>`;
}

function uniqSorted(arr){
  return Array.from(new Set(arr))
    .filter(Boolean)
    .sort((a,b)=>a.localeCompare(b, "es", { sensitivity: "base" }));
}

let DOCS = [];
let ALL_TAGS = [];
let ALL_CATEGORIES = [];

async function loadCatalog(){
  $("pill").textContent = "⏳ Cargando catálogo…";
  setStatus("Cargando docs.json…");

  const res = await fetch("./docs.json", { cache: "no-store" });
  if (!res.ok){
    $("pill").textContent = "❌ Error";
    setStatus("No se pudo cargar docs.json. Asegúrate de que exista en la misma carpeta que index.html.", true);
    DOCS = [];
    renderResults([]);
    renderTags([]);
    populateCategories([]);
    return;
  }

  const raw = await res.json();
  const docs = [];

  for (const d of raw){
    if (!d || d.activo !== true) continue;

    const titulo = (d.titulo ?? "").trim();
    if (!titulo) continue;

    const categoria = (d.categoria ?? "Sin categoría").toString().trim() || "Sin categoría";

    const tags = Array.isArray(d.tags)
      ? d.tags.map(normalizeStr).filter(Boolean)
      : normalizeStr(d.tags ?? "").split(",").map(t=>t.trim()).filter(Boolean);

    const doc = {
      activo: true,
      categoria,
      categoria_norm: normalizeStr(categoria),
      titulo,
      link_drive: (d.link_drive ?? "").trim(),
      ubicacion: (d.ubicacion ?? "").trim(),
      descripcion: (d.descripcion ?? "").trim(),
      tags,
      texto_lectura: (d.texto_lectura ?? "").trim()
    };

    doc._haystack = normalizeStr(
      doc.categoria + " " +
      doc.titulo + " " +
      doc.descripcion + " " +
      doc.tags.join(" ") + " " +
      doc.texto_lectura
    );

    docs.push(doc);
  }

  DOCS = docs;
  ALL_TAGS = uniqSorted(DOCS.flatMap(d => d.tags));
  ALL_CATEGORIES = uniqSorted(DOCS.map(d => d.categoria));

  populateCategories(ALL_CATEGORIES);

  $("pill").textContent = `✅ ${DOCS.length} activos`;
  setStatus(`Listo: <b>${DOCS.length}</b> documentos activos. Filtra por categoría o escribe una búsqueda.`);
  renderTags(ALL_TAGS.slice(0, 30));
  renderResults([]);
}

function populateCategories(categories){
  const sel = $("category");
  const current = sel.value || "__all__";
  sel.innerHTML = `<option value="__all__">Todas</option>`;

  for (const c of categories){
    const opt = document.createElement("option");
    opt.value = normalizeStr(c);      // value normalizado
    opt.textContent = c;              // texto original
    sel.appendChild(opt);
  }

  // intenta mantener selección previa
  const exists = Array.from(sel.options).some(o => o.value === current);
  sel.value = exists ? current : "__all__";
}

function scoreDoc(doc, tokens, mode){
  if (!tokens.length) return 0;
  const hay = doc._haystack;

  if (mode === "exact"){
    const phrase = tokens.join(" ");
    return hay.includes(phrase) ? 999 : 0;
  }

  let score = 0;
  const title = normalizeStr(doc.titulo);
  const desc  = normalizeStr(doc.descripcion);
  const text  = normalizeStr(doc.texto_lectura);
  const cat   = doc.categoria_norm;

  for (const t of tokens){
    if (!t) continue;

    const inTitle = title.includes(t);
    const inCat   = cat.includes(t);
    const inDesc  = desc.includes(t);
    const inTags  = doc.tags.includes(t);
    const inText  = text.includes(t);

    if (inTitle) score += 9;
    if (inTags)  score += 7;
    if (inCat)   score += 5;
    if (inDesc)  score += 4;
    if (inText)  score += 3;

    if (hay.includes(t)) score += 1;
  }

  return score;
}

function passesCategory(doc){
  const selected = $("category").value;
  if (!selected || selected === "__all__") return true;
  return doc.categoria_norm === selected;
}

function search(q){
  const mode = $("mode").value;
  const nq = normalizeStr(q);
  const tokens = nq.split(/\s+/).filter(Boolean);

  // si no hay query, pero sí hay categoría: mostrar docs de esa categoría
  if (!tokens.length){
    return DOCS
      .filter(d => passesCategory(d))
      .sort((a,b) => a.titulo.localeCompare(b.titulo, "es", {sensitivity:"base"}))
      .slice(0, 50);
  }

  const scored = DOCS
    .filter(d => passesCategory(d))
    .map(d => ({ d, s: scoreDoc(d, tokens, mode) }))
    .filter(x => x.s > 0)
    .sort((a,b) => b.s - a.s);

  return scored.slice(0, 50).map(x => x.d);
}

function renderTags(tags){
  const box = $("tagsbar");
  box.innerHTML = "";
  if (!tags.length) return;

  const frag = document.createDocumentFragment();
  for (const t of tags){
    const el = document.createElement("div");
    el.className = "tag";
    el.textContent = "#" + t;
    el.onclick = () => {
      const cur = $("q").value.trim();
      $("q").value = (cur ? cur + " " : "") + t;
      triggerSearch();
      $("q").focus();
    };
    frag.appendChild(el);
  }
  box.appendChild(frag);
}

function renderResults(list){
  const box = $("results");
  box.innerHTML = "";

  if (!list.length){
    const cat = $("category").value;
    const catLabel = (cat && cat !== "__all__") ? " en esa categoría" : "";
    box.innerHTML = `<div class="empty">No hay resultados${catLabel}. Prueba con otros términos o cambia la categoría.</div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  list.forEach(doc => {
    const item = document.createElement("section");
    item.className = "item";

    const tags = doc.tags.slice(0, 12)
      .map(t => `<span class="tag" style="cursor:default">#${escapeHTML(t)}</span>`)
      .join(" ");

    const texto = doc.texto_lectura?.trim();
    const textoBlock = texto
      ? `<div class="desc"><b>Texto sugerido:</b> ${escapeHTML(texto)}</div>`
      : "";

    item.innerHTML = `
      <div class="itemhead">
        <div>
          <h3>${escapeHTML(doc.titulo)}</h3>
          <div class="meta">
            <div><b>Categoría:</b> ${escapeHTML(doc.categoria)}</div>
            <div><b>Ubicación:</b> ${escapeHTML(doc.ubicacion || "—")}</div>
            <div><b>Descripción:</b> ${escapeHTML(doc.descripcion || "—")}</div>
          </div>
          <div class="badges">
            <span class="badge">Fuente: Directorio</span>
            ${doc.categoria ? `<span class="badge">Cat: ${escapeHTML(doc.categoria)}</span>` : ""}
          </div>
        </div>

        <div class="actions">
          <a href="${escapeHTML(doc.link_drive || "#")}" target="_blank" rel="noopener">Abrir PDF</a>
          ${texto ? `<button class="ghost" data-copy="${escapeHTML(texto)}">Copiar texto</button>` : ""}
          <span class="copyok">✅ Copiado</span>
        </div>
      </div>

      <div class="badges" style="margin-top:12px">${tags}</div>
      ${textoBlock}
    `;

    frag.appendChild(item);
  });

  box.appendChild(frag);

  // copiar
  box.querySelectorAll("button[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try{
        await navigator.clipboard.writeText(text);
        const ok = btn.parentElement.querySelector(".copyok");
        if (ok){
          ok.style.display = "inline";
          setTimeout(()=> ok.style.display="none", 1200);
        }
      }catch(e){
        alert("No se pudo copiar. Intenta manualmente.");
      }
    });
  });
}

function triggerSearch(){
  const q = $("q").value;
  const cat = $("category").value;

  const list = search(q);

  const catText = (cat && cat !== "__all__")
    ? ` en <b>${escapeHTML($("category").selectedOptions[0].textContent)}</b>`
    : "";

  if (!normalizeStr(q)){
    setStatus(`Mostrando <b>${list.length}</b> documentos${catText}. (Escribe para buscar más fino).`);
    renderResults(list);
    return;
  }

  setStatus(`Resultados para "<b>${escapeHTML(q)}</b>"${catText}: <b>${list.length}</b> encontrados.`);
  renderResults(list);
}

function wireEvents(){
  $("q").addEventListener("input", () => {
    clearTimeout(window.__t);
    window.__t = setTimeout(triggerSearch, 120);
  });

  $("mode").addEventListener("change", triggerSearch);
  $("category").addEventListener("change", triggerSearch);

  $("reload").addEventListener("click", async () => {
    await loadCatalog();
    triggerSearch();
  });

  $("clear").addEventListener("click", () => {
    $("q").value = "";
    $("category").value = "__all__";
    $("mode").value = "smart";
    triggerSearch();
    $("q").focus();
  });
}

// init
(async function init(){
  wireEvents();
  try{
    await loadCatalog();
    triggerSearch();
  }catch(err){
    console.error(err);
    $("pill").textContent = "❌ Error";
    setStatus("Error inesperado cargando el catálogo. Revisa consola.", true);
  }
})();
