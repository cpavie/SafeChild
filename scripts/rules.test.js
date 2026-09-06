/*
 * Pruebas de ../firestore.rules contra el emulador de Firestore.
 *
 *   cd scripts && npm install && npm test
 *
 * Requiere Node 18+ (firebase-tools 13) y Java, que es lo que usa el
 * emulador por debajo. La app se sigue construyendo con Node 16: por eso
 * este directorio tiene su propio package.json.
 *
 * El escenario tiene DOS familias en el MISMO furgon (apoA y apoB), que
 * es el caso que las reglas viejas no podian distinguir: con
 * `allow read: if request.auth != null` cualquiera de las dos veia los
 * datos personales de los hijos de la otra.
 */

const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const { doc, getDoc, updateDoc, setDoc, setLogLevel } = require("firebase/firestore");

// Cada denegacion esperada imprime un error de gRPC que no aporta nada:
// el resultado de la prueba ya dice si paso o no.
setLogLevel("silent");

const RULES = path.join(__dirname, "..", "firestore.rules");

const DATOS = {
  furgon: {
    F1: { id_conductor: "condA", alumnos: ["al1", "al2"], auxiliares: ["aux1"], fur_coordenadas: [0, 0] },
    F2: { id_conductor: "condB", alumnos: ["al3"], auxiliares: ["aux2"], fur_coordenadas: [0, 0] },
  },
  // apoA y apoB comparten furgon pero son familias distintas.
  apoderado: {
    apoA: { id_persona: "pApoA", id_alumnos: ["al1"], apo_telefono: 1 },
    apoB: { id_persona: "pApoB", id_alumnos: ["al2"], apo_telefono: 2 },
  },
  conductor: {
    condA: { id_persona: "pCondA", id_furgon: "F1", id_licencia: "lic1", con_estado: 0, con_telefono: 3 },
    condB: { id_persona: "pCondB", id_furgon: "F2", id_licencia: "lic2", con_estado: 0, con_telefono: 4 },
  },
  alumno: {
    al1: { id_persona: "pAl1", id_furgon: "F1", alu_estado: 0, alu_comentario: "" },
    al2: { id_persona: "pAl2", id_furgon: "F1", alu_estado: 0, alu_comentario: "" },
    al3: { id_persona: "pAl3", id_furgon: "F2", alu_estado: 0, alu_comentario: "" },
  },
  auxiliar: {
    aux1: { id_persona: "pAux1", aux_estado: 0, id_furgon: "F1" },
    aux2: { id_persona: "pAux2", aux_estado: 0, id_furgon: "F2" },
  },
  licencia: {
    lic1: { lic_foto: "a.jpg", id_furgon: "F1" },
    lic2: { lic_foto: "b.jpg", id_furgon: "F2" },
  },
  persona: {
    pApoA: { p_nombres: "Apo", p_apellidos: "A", p_direccion: "x", p_comuna: "y", p_tipo: "apoderado" },
    pApoB: { p_nombres: "Apo", p_apellidos: "B", p_direccion: "x", p_comuna: "y", p_tipo: "apoderado" },
    pCondA: { p_nombres: "Cond", p_apellidos: "A", p_direccion: "x", p_comuna: "y", p_tipo: "conductor", id_furgon: "F1" },
    pCondB: { p_nombres: "Cond", p_apellidos: "B", p_direccion: "x", p_comuna: "y", p_tipo: "conductor", id_furgon: "F2" },
    pAl1: { p_nombres: "Alu", p_apellidos: "Uno", p_direccion: "x", p_comuna: "y", p_tipo: "alumno", id_furgon: "F1", id_alumno: "al1" },
    pAl2: { p_nombres: "Alu", p_apellidos: "Dos", p_direccion: "x", p_comuna: "y", p_tipo: "alumno", id_furgon: "F1", id_alumno: "al2" },
    pAl3: { p_nombres: "Alu", p_apellidos: "Tres", p_direccion: "x", p_comuna: "y", p_tipo: "alumno", id_furgon: "F2", id_alumno: "al3" },
    pAux1: { p_nombres: "Aux", p_apellidos: "Uno", p_direccion: "x", p_comuna: "y", p_tipo: "auxiliar", id_furgon: "F1" },
    pAux2: { p_nombres: "Aux", p_apellidos: "Dos", p_direccion: "x", p_comuna: "y", p_tipo: "auxiliar", id_furgon: "F2" },
  },
};

let entorno;
let fallos = 0;
let pasadas = 0;

async function prueba(nombre, fn) {
  try {
    await fn();
    pasadas++;
    console.log(`  ok   ${nombre}`);
  } catch (err) {
    fallos++;
    console.log(`  FALLA ${nombre}`);
    console.log(`        ${err && err.message ? err.message : err}`);
  }
}

// Azucar para que cada caso se lea como una frase.
const como = (uid) => entorno.authenticatedContext(uid).firestore();
const anonimo = () => entorno.unauthenticatedContext().firestore();
const leer = (db, col, id) => getDoc(doc(db, col, id));
const escribir = (db, col, id, campos) => updateDoc(doc(db, col, id), campos);

async function main() {
  entorno = await initializeTestEnvironment({
    projectId: "safechild-rules-test",
    firestore: { rules: fs.readFileSync(RULES, "utf8") },
  });

  await entorno.clearFirestore();
  await entorno.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const [coleccion, docs] of Object.entries(DATOS)) {
      for (const [id, datos] of Object.entries(docs)) {
        await setDoc(doc(db, coleccion, id), datos);
      }
    }
  });

  console.log("\nPERMITIDO (lo que la app necesita para funcionar)\n");

  await prueba("apoderado lee la persona de su alumno", () =>
    assertSucceeds(leer(como("apoA"), "persona", "pAl1"))
  );
  await prueba("apoderado lee la persona del conductor de su furgon", () =>
    assertSucceeds(leer(como("apoA"), "persona", "pCondA"))
  );
  await prueba("apoderado lee la persona del auxiliar de su furgon", () =>
    assertSucceeds(leer(como("apoA"), "persona", "pAux1"))
  );
  await prueba("apoderado lee el auxiliar de su furgon", () =>
    assertSucceeds(leer(como("apoA"), "auxiliar", "aux1"))
  );
  await prueba("apoderado lee la licencia del conductor de su furgon", () =>
    assertSucceeds(leer(como("apoA"), "licencia", "lic1"))
  );
  await prueba("apoderado lee el conductor de su furgon", () =>
    assertSucceeds(leer(como("apoA"), "conductor", "condA"))
  );
  await prueba("apoderado lee su furgon", () =>
    assertSucceeds(leer(como("apoA"), "furgon", "F1"))
  );
  await prueba("apoderado lee su propio alumno", () =>
    assertSucceeds(leer(como("apoA"), "alumno", "al1"))
  );
  await prueba("apoderado edita direccion/comuna de su alumno", () =>
    assertSucceeds(escribir(como("apoA"), "persona", "pAl1", { p_direccion: "n", p_comuna: "m" }))
  );
  await prueba("apoderado edita el comentario de su alumno", () =>
    assertSucceeds(escribir(como("apoA"), "alumno", "al1", { alu_comentario: "alergico" }))
  );
  await prueba("apoderado edita su propio telefono", () =>
    assertSucceeds(escribir(como("apoA"), "apoderado", "apoA", { apo_telefono: 9 }))
  );
  await prueba("apoderado edita su propia direccion", () =>
    assertSucceeds(escribir(como("apoA"), "persona", "pApoA", { p_direccion: "n", p_comuna: "m" }))
  );

  await prueba("conductor lee la persona de un alumno de su furgon", () =>
    assertSucceeds(leer(como("condA"), "persona", "pAl1"))
  );
  await prueba("conductor lee la persona de su auxiliar", () =>
    assertSucceeds(leer(como("condA"), "persona", "pAux1"))
  );
  await prueba("conductor lee su propia licencia", () =>
    assertSucceeds(leer(como("condA"), "licencia", "lic1"))
  );
  await prueba("conductor marca alu_estado de un alumno suyo", () =>
    assertSucceeds(escribir(como("condA"), "alumno", "al1", { alu_estado: 1 }))
  );
  await prueba("conductor actualiza las coordenadas de su furgon", () =>
    assertSucceeds(escribir(como("condA"), "furgon", "F1", { fur_coordenadas: [1, 2] }))
  );
  await prueba("conductor marca aux_estado de su auxiliar", () =>
    assertSucceeds(escribir(como("condA"), "auxiliar", "aux1", { aux_estado: 1 }))
  );
  await prueba("conductor abre y cierra su ruta (con_estado)", () =>
    assertSucceeds(escribir(como("condA"), "conductor", "condA", { con_estado: 1 }))
  );

  console.log("\nDENEGADO (los huecos que se estan cerrando)\n");

  await prueba("otra familia del MISMO furgon NO lee la persona de un alumno ajeno", () =>
    assertFails(leer(como("apoB"), "persona", "pAl1"))
  );
  await prueba("apoderado NO lee la persona de un alumno de otro furgon", () =>
    assertFails(leer(como("apoA"), "persona", "pAl3"))
  );
  await prueba("apoderado NO lee un auxiliar de otro furgon", () =>
    assertFails(leer(como("apoA"), "auxiliar", "aux2"))
  );
  await prueba("apoderado NO lee la licencia de otro conductor", () =>
    assertFails(leer(como("apoA"), "licencia", "lic2"))
  );
  await prueba("apoderado NO lee un conductor de otro furgon", () =>
    assertFails(leer(como("apoA"), "conductor", "condB"))
  );
  await prueba("apoderado NO lee el documento de otro apoderado", () =>
    assertFails(leer(como("apoA"), "apoderado", "apoB"))
  );
  await prueba("apoderado NO lee un alumno que no es suyo", () =>
    assertFails(leer(como("apoA"), "alumno", "al2"))
  );
  await prueba("apoderado NO edita la persona de un alumno ajeno", () =>
    assertFails(escribir(como("apoA"), "persona", "pAl3", { p_direccion: "n" }))
  );
  await prueba("apoderado NO edita la direccion del conductor", () =>
    assertFails(escribir(como("apoA"), "persona", "pCondA", { p_direccion: "n" }))
  );
  await prueba("apoderado NO cambia el nombre de su alumno (campo fuera de lista)", () =>
    assertFails(escribir(como("apoA"), "persona", "pAl1", { p_nombres: "otro" }))
  );
  await prueba("apoderado NO reasigna su alumno a otro furgon (escalada por backlink)", () =>
    assertFails(escribir(como("apoA"), "persona", "pAl1", { id_furgon: "F2" }))
  );
  // El valor tiene que ser distinto del que ya tiene el documento: un
  // write que no cambia nada deja affectedKeys() vacio, y una lista
  // vacia pasa cualquier hasOnly(). No es un hueco (no modifica nada),
  // pero si escribe el caso con el mismo valor la prueba no prueba nada.
  await prueba("apoderado NO marca a su alumno como a bordo (alu_estado es del conductor)", () =>
    assertFails(escribir(como("apoA"), "alumno", "al1", { alu_estado: 9 }))
  );
  await prueba("conductor NO lee la persona de un alumno de otro furgon", () =>
    assertFails(leer(como("condB"), "persona", "pAl1"))
  );
  await prueba("conductor NO escribe un alumno de otro furgon", () =>
    assertFails(escribir(como("condB"), "alumno", "al1", { alu_estado: 1 }))
  );
  await prueba("conductor NO se reasigna a otro furgon", () =>
    assertFails(escribir(como("condA"), "conductor", "condA", { id_furgon: "F2" }))
  );
  await prueba("conductor NO edita la direccion de un alumno", () =>
    assertFails(escribir(como("condA"), "persona", "pAl1", { p_direccion: "n" }))
  );
  await prueba("nadie crea documentos desde el cliente", () =>
    assertFails(setDoc(doc(como("condA"), "alumno", "nuevo"), { id_persona: "x" }))
  );
  await prueba("sin sesion no se lee nada", () =>
    assertFails(leer(anonimo(), "persona", "pAl1"))
  );
  await prueba("sin sesion no se lee el furgon (posicion en vivo)", () =>
    assertFails(leer(anonimo(), "furgon", "F1"))
  );

  await entorno.cleanup();

  console.log(`\n${pasadas} pasadas, ${fallos} fallidas\n`);
  process.exit(fallos > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
