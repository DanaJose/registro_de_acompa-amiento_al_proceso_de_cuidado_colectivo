// ---------------------------------------------------------
// CONFIGURACIÓN DE ENVÍO CIFRADO (opcional)
// ---------------------------------------------------------
const WORKER_URL = "https://long-heart-1ec8.via-paratodxs.workers.dev";

const LLAVE_PUBLICA = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEalgOVBYJKwYBBAHaRw8BAQdAg0xGNOzedu+d5RXHwbDk9IeVI+1Iji+X
REu+Dh8qKE3NKlZJQSBDb29yZGluYWNpb24gPHZpYS5wYXJhdG9keHNAcHJv
dG9uLm1lPsLAEwQTFgoAhQWCalgOVAMLCQcJEG2xzJchG0MoRRQAAAAAABwA
IHNhbHRAbm90YXRpb25zLm9wZW5wZ3Bqcy5vcmdENss10Bxj6kJKqkn0578R
4LpmlKXVHn1aTnq88j8dTgUVCggODAQWAAIBAhkBApsDAh4BFiEE3Mz98ulk
nU7lbO18bbHMlyEbQygAAJRZAP9zlqwts8dQQ/VB3C0noAmqbmm/KPBpLAlm
i09TBbzHqgD/ciGuUf82RuBkBPFomA1VrrilJTDZJxZh0tpuafzSywXOOARq
WA5UEgorBgEEAZdVAQUBAQdAvEHHWqbp0EnN6FXHm3ZD4epedlg+0h7pDTVC
qgUCbkQDAQgHwr4EGBYKAHAFgmpYDlQJEG2xzJchG0MoRRQAAAAAABwAIHNh
bHRAbm90YXRpb25zLm9wZW5wZ3Bqcy5vcmcSHY+DeF5SKNnv4v78sZj1M9kl
NcQmflcZrCx87xsqfAKbDBYhBNzM/fLpZJ1O5WztfG2xzJchG0MoAAAHyAEA
0uVQMpKL1S2nlOiw3hKyUzvxUeYiOdlE7sC/QpMeAVMBAKc0sUIbxwo8bs/I
SlJsvizzy2jjJ7epTODtqDg9GXEF
=Aajs
-----END PGP PUBLIC KEY BLOCK-----`;

// ---------------------------------------------------------
// DATOS: zonas corporales de la guía somática (hoja 3)
// ---------------------------------------------------------
const ZONAS = [
  { id: "cabeza", nombre: "Cabeza y mente", placeholder: "Pensamientos, claridad, ruido mental..." },
  { id: "garganta", nombre: "Garganta y voz", placeholder: "¿Hay algo que cuesta decir o tragar?" },
  { id: "pecho", nombre: "Pecho y corazón", placeholder: "Respiración, latido, opresión, apertura..." },
  { id: "estomago", nombre: "Estómago y plexo solar", placeholder: "Nudo, vacío, calma, nervios..." },
  { id: "espalda", nombre: "Espalda y hombros", placeholder: "Peso, carga, sostén..." },
  { id: "brazos", nombre: "Brazos y manos", placeholder: "Fuerza, temblor, ganas de actuar o de soltar..." },
  { id: "piernas", nombre: "Piernas y pies", placeholder: "Apoyo, arraigo, ganas de moverte o de quedarte quieta..." },
];

// ---------------------------------------------------------
// ESTADO
// ---------------------------------------------------------
const estado = {
  hojaActual: 1,
  preguntas: {},
  somatico: {},
  envioAceptado: false
};

// ---------------------------------------------------------
// CONSTRUCCIÓN DE LA HOJA 3 a partir de ZONAS
// ---------------------------------------------------------
function construirZonas() {
  const contenedor = document.getElementById("lista-zonas");
  ZONAS.forEach(zona => {
    const div = document.createElement("div");
    div.className = "zona";
    div.innerHTML = `
      <div class="zona-header"><h3>${zona.nombre}</h3></div>
      <div class="zona-escala">
        <span class="escala-extremo">en calma</span>
        <input type="range" min="1" max="5" value="3" class="slider" data-zona="${zona.id}">
        <span class="escala-extremo">mucha tensión</span>
      </div>
      <textarea class="zona-texto" data-zona="${zona.id}" rows="2" placeholder="${zona.placeholder}"></textarea>
    `;
    contenedor.appendChild(div);
  });
}

// ---------------------------------------------------------
// NAVEGACIÓN ENTRE HOJAS
// ---------------------------------------------------------
function irAHoja(numero) {
  document.querySelectorAll(".hoja").forEach(h => h.classList.remove("activa"));

  const idHoja = numero === 4 ? "hoja-final" : `hoja-${numero}`;
  document.getElementById(idHoja).classList.add("activa");

  document.querySelectorAll(".punto").forEach(p => {
    const n = Number(p.dataset.punto);
    p.classList.toggle("activo", n === numero);
    p.classList.toggle("completo", n < numero);
  });

  estado.hojaActual = numero;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------------------------------------------------
// RECOLECCIÓN DE DATOS
// ---------------------------------------------------------
function recolectarPreguntas() {
  const form = document.getElementById("form-preguntas");
  const datos = new FormData(form);
  const resultado = {};

  for (const [clave, valor] of datos.entries()) {
    if (resultado[clave]) {
      if (Array.isArray(resultado[clave])) {
        resultado[clave].push(valor);
      } else {
        resultado[clave] = [resultado[clave], valor];
      }
    } else {
      resultado[clave] = valor;
    }
  }
  return resultado;
}

function recolectarSomatico() {
  const resultado = {};
  document.querySelectorAll(".slider").forEach(slider => {
    const zona = slider.dataset.zona;
    const texto = document.querySelector(`.zona-texto[data-zona="${zona}"]`).value;
    resultado[zona] = { nivel: Number(slider.value), nota: texto };
  });
  return resultado;
}

// ---------------------------------------------------------
// GENERAR RESUMEN
// ---------------------------------------------------------
function generarResumenTexto() {
  const p = estado.preguntas;
  const s = estado.somatico;
  const fecha = new Date().toLocaleString("es-AR");

  const listar = valor => Array.isArray(valor) ? valor.join(", ") : (valor || "—");

  let texto = `PRE-REGISTRO — PROCESO DE ACOMPAÑAMIENTO PSICOSOCIAL\n`;
  texto += `Completado el: ${fecha}\n`;
  texto += `${"=".repeat(50)}\n\n`;

  texto += `-- LABOR COMO DEFENSORA --\n`;
  texto += `Organización: ${listar(p.organizacion)}\n`;
  texto += `Tiempo en la labor: ${listar(p.tiempo_labor)}\n`;
  texto += `Riesgos: ${listar(p.riesgo)}\n`;
  texto += `Contexto actual: ${listar(p.contexto_actual)}\n\n`;

  texto += `-- HISTORIA CON PROCESOS DE ACOMPAÑAMIENTO --\n`;
  texto += `¿Participó antes?: ${listar(p.participo_antes)}\n`;
  texto += `Qué sirvió / no sirvió: ${listar(p.historial_procesos)}\n`;
  texto += `Prácticas de autocuidado actuales: ${listar(p.practicas_autocuidado)}\n\n`;

  texto += `-- EXPECTATIVAS Y DISPONIBILIDAD --\n`;
  texto += `Expectativas: ${listar(p.expectativas)}\n`;
  texto += `Disponibilidad: ${listar(p.disponibilidad)}\n`;
  texto += `Modalidad preferida: ${listar(p.modalidad)}\n`;
  texto += `Frecuencia preferida: ${listar(p.frecuencia)}\n\n`;

  texto += `-- GUÍA SOMÁTICA (línea base) --\n`;
  texto += `General: nivel ${s.general.nivel}/5 — ${s.general.nota || "sin nota"}\n`;
  ZONAS.forEach(z => {
    const dato = s[z.id];
    texto += `${z.nombre}: nivel ${dato.nivel}/5 — ${dato.nota || "sin nota"}\n`;
  });

  return texto;
}

function descargarResumen(contenido) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const fechaArchivo = new Date().toISOString().slice(0, 10);
  enlace.href = url;
  enlace.download = `pre-registro_${fechaArchivo}.txt`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------
// CIFRADO Y ENVÍO OPCIONAL
// ---------------------------------------------------------
async function cifrarTexto(textoPlano) {
  const publicKey = await openpgp.readKey({ armoredKey: LLAVE_PUBLICA });
  const mensaje = await openpgp.createMessage({ text: textoPlano });

  const cifrado = await openpgp.encrypt({
    message: mensaje,
    encryptionKeys: publicKey,
  });

  return cifrado;
}

async function enviarCifrado(textoPlano) {
  try {
    const cifrado = await cifrarTexto(textoPlano);

    const respuesta = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensajeCifrado: cifrado }),
    });

    return respuesta.ok;
  } catch (error) {
    console.error("Error al enviar el pre-registro cifrado:", error);
    return false;
  }
}

// ---------------------------------------------------------
// EVENTOS
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  construirZonas();

  const checkboxConsentimiento = document.getElementById("consentimiento");
  const checkboxEnvio = document.getElementById("consentimiento-envio");
  const btnAHoja2 = document.getElementById("btn-a-hoja-2");
  const notaConsentimiento = document.getElementById("nota-consentimiento");

  checkboxConsentimiento.addEventListener("change", () => {
    btnAHoja2.disabled = !checkboxConsentimiento.checked;
    notaConsentimiento.style.visibility = checkboxConsentimiento.checked ? "hidden" : "visible";
  });

  checkboxEnvio.addEventListener("change", () => {
    estado.envioAceptado = checkboxEnvio.checked;
  });

  btnAHoja2.addEventListener("click", () => irAHoja(2));

  document.getElementById("btn-a-hoja-1-desde-2").addEventListener("click", () => irAHoja(1));
  document.getElementById("btn-a-hoja-3").addEventListener("click", () => {
    estado.preguntas = recolectarPreguntas();
    irAHoja(3);
  });

  document.getElementById("btn-a-hoja-2-desde-3").addEventListener("click", () => irAHoja(2));
  document.getElementById("btn-finalizar").addEventListener("click", () => {
    estado.somatico = recolectarSomatico();
    estado.preguntas = recolectarPreguntas();
    irAHoja(4);
  });

  document.getElementById("btn-descargar").addEventListener("click", async () => {
    const btnDescargar = document.getElementById("btn-descargar");
    const confirmacion = document.getElementById("confirmacion-descarga");
    const contenido = generarResumenTexto();

    btnDescargar.disabled = true;
    confirmacion.textContent = "Procesando...";

    descargarResumen(contenido);

    if (estado.envioAceptado) {
      const enviado = await enviarCifrado(contenido);
      confirmacion.textContent = enviado
        ? "Descargado y enviado de forma cifrada. Podés cerrar esta página cuando quieras."
        : "Descargado. Hubo un problema con el envío cifrado — igual conservás tu copia local.";
    } else {
      confirmacion.textContent = "Descargado. Podés cerrar esta página cuando quieras.";
    }

    btnDescargar.disabled = false;
  });
});

