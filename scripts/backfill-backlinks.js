#!/usr/bin/env node
/*
 * Siembra los campos de respaldo ("backlinks") que necesitan las reglas
 * de firestore.rules para poder verificar quien puede leer que.
 *
 *   persona/{id}   -> p_tipo, id_furgon, id_alumno
 *   auxiliar/{id}  -> id_furgon
 *   licencia/{id}  -> id_furgon
 *
 * El esquema original no guarda ninguna referencia hacia atras (una
 * persona no sabe de que alumno es, un auxiliar no sabe de que furgon),
 * y las reglas de Firestore no pueden hacer esa busqueda inversa. Ver el
 * encabezado de firestore.rules.
 *
 * HAY QUE CORRERLO ANTES DE DESPLEGAR LAS REGLAS NUEVAS. Si se
 * despliegan primero, la app deja de poder leer nombres y direcciones
 * (falla cerrado: sin backlink, ninguna rama del OR autoriza).
 *
 * Uso (desde scripts/, con Node 18+ y `npm install` hecho):
 *   # 1. contra el emulador, para ver que haria (no escribe nada)
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run backfill
 *
 *   # 2. contra el emulador, escribiendo
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run backfill -- --apply
 *
 *   # 3. contra produccion (requiere credenciales de servicio)
 *   GOOGLE_APPLICATION_CREDENTIALS=./clave.json npm run backfill
 *   GOOGLE_APPLICATION_CREDENTIALS=./clave.json npm run backfill -- --apply
 *
 * Es idempotente: solo escribe los documentos a los que les falta algun
 * campo o lo tienen con otro valor, asi que se puede repetir sin riesgo.
 *
 * Nota: firebase-admin v13+ no expone admin.firestore(); hay que usar
 * los subpaths modulares (de ahi los require de abajo).
 */

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "furgoncito-eb920";
const APPLY = process.argv.includes("--apply");
const EMULADOR = !!process.env.FIRESTORE_EMULATOR_HOST;

// Contra el emulador no hay (ni hacen falta) credenciales; contra
// produccion se exigen explicitamente para no escribir por accidente
// con alguna credencial ambiente que el operador no tenia en mente.
if (!EMULADOR && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "Falta GOOGLE_APPLICATION_CREDENTIALS (o FIRESTORE_EMULATOR_HOST para\n" +
      "correr contra el emulador). Abortado sin tocar nada."
  );
  process.exit(1);
}

initializeApp(
  EMULADOR
    ? { projectId: PROJECT_ID }
    : { projectId: PROJECT_ID, credential: applicationDefault() }
);

const db = getFirestore();

// Los arrays del esquema a veces estan guardados como mapa {0: 'x'} y
// otras como array: Object.values() sirve para ambos (es lo mismo que
// hace la app al leerlos).
function comoLista(valor) {
  if (!valor) {
    return [];
  }
  return Object.values(valor).filter((v) => typeof v === "string" && v);
}

// Acumula los cambios por documento en vez de escribir sobre la marcha:
// una misma persona puede tocarse desde dos lados (p.ej. si quedo
// asignada a dos furgones) y asi el conflicto se ve antes de escribir.
const pendientes = new Map();

function marcar(coleccion, id, campos) {
  if (!id) {
    return;
  }
  const clave = `${coleccion}/${id}`;
  const actual = pendientes.get(clave) || { coleccion, id, campos: {} };
  for (const [k, v] of Object.entries(campos)) {
    if (actual.campos[k] !== undefined && actual.campos[k] !== v) {
      console.warn(
        `  aviso: ${clave}.${k} sale de dos origenes distintos ` +
          `("${actual.campos[k]}" y "${v}"); se conserva el primero`
      );
      continue;
    }
    actual.campos[k] = v;
  }
  pendientes.set(clave, actual);
}

async function leer(coleccion, id) {
  if (!id) {
    return null;
  }
  const snap = await db.collection(coleccion).doc(id).get();
  return snap.exists ? snap : null;
}

async function planificar() {
  const furgones = await db.collection("furgon").get();
  console.log(`Furgones encontrados: ${furgones.size}`);

  for (const furgon of furgones.docs) {
    const idFurgon = furgon.id;
    const datos = furgon.data();

    // --- alumnos del furgon ---
    for (const idAlumno of comoLista(datos.alumnos)) {
      const alumno = await leer("alumno", idAlumno);
      if (!alumno) {
        console.warn(`  aviso: furgon/${idFurgon} apunta a alumno/${idAlumno}, que no existe`);
        continue;
      }
      marcar("persona", alumno.get("id_persona"), {
        p_tipo: "alumno",
        id_furgon: idFurgon,
        id_alumno: idAlumno,
      });
    }

    // --- auxiliares del furgon ---
    for (const idAuxiliar of comoLista(datos.auxiliares)) {
      const auxiliar = await leer("auxiliar", idAuxiliar);
      if (!auxiliar) {
        console.warn(`  aviso: furgon/${idFurgon} apunta a auxiliar/${idAuxiliar}, que no existe`);
        continue;
      }
      marcar("auxiliar", idAuxiliar, { id_furgon: idFurgon });
      marcar("persona", auxiliar.get("id_persona"), {
        p_tipo: "auxiliar",
        id_furgon: idFurgon,
      });
    }

    // --- conductor y su licencia ---
    const conductor = await leer("conductor", datos.id_conductor);
    if (!conductor) {
      console.warn(`  aviso: furgon/${idFurgon} no tiene un conductor valido`);
      continue;
    }
    marcar("persona", conductor.get("id_persona"), {
      p_tipo: "conductor",
      id_furgon: idFurgon,
    });
    if (conductor.get("id_licencia")) {
      marcar("licencia", conductor.get("id_licencia"), { id_furgon: idFurgon });
    }
  }

  // --- apoderados: solo el tipo, no pertenecen a un furgon ---
  const apoderados = await db.collection("apoderado").get();
  console.log(`Apoderados encontrados: ${apoderados.size}`);
  for (const apoderado of apoderados.docs) {
    marcar("persona", apoderado.get("id_persona"), { p_tipo: "apoderado" });
  }
}

async function aplicar() {
  let porEscribir = 0;
  let yaAlDia = 0;
  let faltantes = 0;

  // Lotes de 400 (el limite duro son 500 operaciones por batch).
  let batch = db.batch();
  let enLote = 0;

  for (const { coleccion, id, campos } of pendientes.values()) {
    const ref = db.collection(coleccion).doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`  aviso: ${coleccion}/${id} referenciado pero no existe; se omite`);
      faltantes++;
      continue;
    }

    const actuales = snap.data();
    const diff = {};
    for (const [k, v] of Object.entries(campos)) {
      if (actuales[k] !== v) {
        diff[k] = v;
      }
    }
    if (Object.keys(diff).length === 0) {
      yaAlDia++;
      continue;
    }

    porEscribir++;
    console.log(`  ${coleccion}/${id} <- ${JSON.stringify(diff)}`);
    if (APPLY) {
      batch.update(ref, diff);
      enLote++;
      if (enLote >= 400) {
        await batch.commit();
        batch = db.batch();
        enLote = 0;
      }
    }
  }

  if (APPLY && enLote > 0) {
    await batch.commit();
  }

  console.log(
    `\nResumen: ${porEscribir} documento(s) a actualizar, ` +
      `${yaAlDia} ya al dia, ${faltantes} referenciado(s) inexistente(s).`
  );
  if (!APPLY) {
    console.log("Simulacion: no se escribio nada. Repetir con --apply para aplicar.");
  } else {
    console.log("Cambios aplicados. Ya se pueden desplegar las reglas nuevas.");
  }
}

(async () => {
  console.log(
    `Proyecto: ${PROJECT_ID}  |  destino: ${
      EMULADOR ? `emulador (${process.env.FIRESTORE_EMULATOR_HOST})` : "PRODUCCION"
    }  |  modo: ${APPLY ? "APLICAR" : "simulacion"}\n`
  );
  await planificar();
  console.log("");
  await aplicar();
})().catch((err) => {
  console.error("\nError:", err && err.message ? err.message : err);
  process.exit(1);
});
