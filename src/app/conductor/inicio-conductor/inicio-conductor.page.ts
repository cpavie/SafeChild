import { Component, NgZone, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { DatosService } from "src/app/servicios/datos.service";
import { ALU_ESTADO, Auxiliar, Conductor, Furgon, Persona } from "src/app/models/safechild.models";

// La seleccion vive en la propia fila (`on`) en vez de en tres arrays
// paralelos (ids / nombres / checkboxes) que antes podian
// desincronizarse entre si.
interface FilaRoster {
  id: string;
  nombre: string;
  direccion: string;
  on: boolean;
}

// nombres y apellidos se guardan por separado, no concatenados: el
// rastreo necesita la Persona con sus dos campos, y volver a partir un
// "nombre completo" por el primer espacio rompe cualquier nombre
// compuesto ("Ana María Soto Rojas" daria p_nombres "Ana").
interface FilaAuxiliar {
  id: string;
  nombres: string;
  apellidos: string;
}

@Component({
  selector: "app-inicio-conductor",
  templateUrl: "./inicio-conductor.page.html",
  styleUrls: ["./inicio-conductor.page.scss"],
})
export class InicioConductorPage implements OnInit {
  uid: string;
  roster: FilaRoster[] = [];
  auxiliares: FilaAuxiliar[] = [];
  bind: string;
  // Distingue "todavia no se cuantos alumnos hay" de "no hay ninguno":
  // sin esto la pantalla mostraba una lista en blanco durante la carga,
  // identica a la de un conductor sin alumnos asignados.
  cargando = true;

  constructor(
    public AFA: AngularFireAuth,
    private db: AngularFirestore,
    public dataService: DatosService,
    public router: Router,
    public alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    // Ver el comentario en getInfo(): las lecturas de Firestore que
    // llegan al volver a esta tab no disparan deteccion de cambios.
    private zone: NgZone
  ) {}

  private async toast(message: string, color: string = "medium") {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
    });
    toast.present();
  }

  ngOnInit() {
    // `res && res.uid` y no `res.uid !== null`: al cerrar sesion
    // authState emite null, y leer .uid de null lanzaba una excepcion
    // que quedaba como promesa rechazada suelta en cada logout.
    this.AFA.authState.forEach((res) => {
      if (res && res.uid) {
        this.uid = res.uid;
        this.getInfo();
      }
    });
  }

  // Al volver desde "Finalizar ruta" esta pagina sigue viva (es una
  // tab, Ionic no la destruye), asi que ngOnInit no vuelve a correr:
  // sin esto quedaria el roster con la seleccion de la ruta anterior y
  // los alumnos que ya fueron entregados.
  ionViewWillEnter() {
    if (this.uid) {
      this.bind = undefined;
      this.getInfo();
    }
  }

  get seleccionados() {
    return this.roster.filter((alumno) => alumno.on);
  }

  get puedeComenzar(): boolean {
    return this.seleccionados.length > 0 && !!this.bind;
  }

  // El pie decia siempre "Seleccione alumnos y un auxiliar", incluso
  // cuando no habia ninguno que seleccionar: el conductor no tenia como
  // saber si la lista estaba cargando, vacia o si le faltaba tocar algo.
  get hintComenzar(): string {
    if (this.cargando) {
      return "Cargando la lista de alumnos…";
    }
    if (this.roster.length === 0) {
      return "No hay alumnos asignados a su furgón";
    }
    if (this.auxiliares.length === 0) {
      return "No hay auxiliares asignados a su furgón";
    }
    if (this.seleccionados.length === 0) {
      return "Seleccione los alumnos que van a bordo";
    }
    return "Seleccione un auxiliar para comenzar";
  }

  // Una fila sin nombre todavia no termina de cargar; dejarla marcar
  // guardaria "" como nombre del alumno en la ruta (dataService
  // .nombres_alumnos alimenta la cabecera del rastreo).
  alternar(alumno: { nombre: string; on: boolean }) {
    if (alumno.nombre) {
      alumno.on = !alumno.on;
    }
  }

  // Mismo motivo que alternar(): comenzarRuta() copia nombres y
  // apellidos del chip elegido a dataService, y elegir uno a medio
  // cargar dejaba la cabecera del rastreo sin el nombre del auxiliar.
  elegirAuxiliar(auxiliar: { id: string; nombres: string }) {
    if (auxiliar.nombres) {
      this.bind = auxiliar.id;
    }
  }

  private avisandoErrorCarga = false;

  // Cadena de lecturas anidadas (conductor -> persona -> furgon ->
  // auxiliar/alumno -> persona) sin manejo de error: si algo fallaba
  // (permiso denegado, doc borrado), la pantalla quedaba a medio
  // cargar sin avisar. Se agrega .catch() en cada nivel. El flag evita
  // apilar un alert por cada lectura que falle.
  private avisarErrorCarga() {
    if (this.avisandoErrorCarga) {
      return;
    }
    this.avisandoErrorCarga = true;
    // Si falla la primera lectura no llega nunca el roster, y sin
    // apagar el flag la pantalla se quedaria con las filas fantasma
    // girando para siempre.
    this.zone.run(() => (this.cargando = false));
    this.toast("No se pudo cargar parte de la información. Intente de nuevo.", "danger");
    this.avisandoErrorCarga = false;
  }

  /*
   * Lee un documento suelto. Concentra las dos precauciones que antes
   * se repetian a mano en cada nivel de la piramide, que era donde se
   * colaban los errores:
   *
   *  - id vacio: doc(undefined) NO falla al construirse (Firestore lo
   *    toma como "genera un id nuevo") y recien el get() se rechaza por
   *    reglas, asi que se corta antes.
   *  - error de lectura: se avisa una sola vez y se devuelve null, en
   *    vez de dejar la pantalla a medio cargar en silencio.
   */
  private async leer(coleccion: string, id: string) {
    if (!id) {
      return null;
    }
    try {
      return await this.db.collection(coleccion).doc(id).get().toPromise();
    } catch {
      this.avisarErrorCarga();
      return null;
    }
  }

  /*
   * Las escrituras que rellenan roster/auxiliares van dentro de
   * zone.run() aun con async/await: al volver a esta tab
   * (ionViewWillEnter) el componente ya existe, y estas lecturas
   * resuelven fuera de un ciclo de Angular (Zone.js captura la zona al
   * registrar el await, no al resolverse), asi que las filas quedaban
   * con los datos correctos en memoria pero en blanco en pantalla. En
   * la primera carga no se notaba porque el arranque dispara deteccion
   * igual.
   */
  async getInfo() {
    this.cargando = true;

    const conductorDoc = await this.leer("conductor", this.uid);
    if (!conductorDoc) {
      return;
    }
    this.dataService.setDataConductor(conductorDoc.data() as Conductor);
    const datosConductor = this.dataService.getDataConductor();

    // La persona del conductor y el furgon cuelgan los dos del mismo
    // documento, asi que se piden a la vez. Antes el furgon esperaba a
    // que llegara la persona sin necesitarla para nada.
    const [personaDoc, furgonDoc] = await Promise.all([
      this.leer("persona", datosConductor.id_persona),
      this.leer("furgon", datosConductor.id_furgon),
    ]);
    if (personaDoc) {
      this.dataService.setDataConductorPersona(personaDoc.data() as Persona);
    }
    if (!furgonDoc) {
      this.zone.run(() => (this.cargando = false));
      return;
    }
    this.dataService.setdataFurgon(furgonDoc.data() as Furgon);

    // Cada tarea se queda con SU fila por closure (no con el indice
    // dentro del array actual): authState puede emitir de nuevo y
    // reemplazar el array mientras estas consultas siguen en vuelo, y
    // escribir por indice reventaria con "cannot set property of
    // undefined".
    const idsAuxiliares: string[] = Object.values(
      furgonDoc.get("auxiliares") || {}
    );
    const filasAux: FilaAuxiliar[] = idsAuxiliares.map((id) => ({
      id,
      nombres: "",
      apellidos: "",
    }));

    const idsAlumnos: string[] = Object.values(furgonDoc.get("alumnos") || {});
    const filasRoster: FilaRoster[] = idsAlumnos.map((id) => ({
      id,
      nombre: "",
      direccion: "",
      on: false,
    }));

    // Las dos listas y el flag se publican juntos y dentro de la zona:
    // si el furgon no tiene alumnos, ninguna tarea de fila va a correr
    // despues, asi que esta es la unica oportunidad de disparar
    // deteccion de cambios y mostrar el estado vacio.
    this.zone.run(() => {
      this.auxiliares = filasAux;
      this.roster = filasRoster;
      this.cargando = false;
    });

    // En paralelo, como hacian los callbacks: en serie serian dos
    // viajes de ida y vuelta por cada alumno y por cada auxiliar.
    await Promise.all([
      ...filasAux.map((fila) => this.completarAuxiliar(fila)),
      ...filasRoster.map((fila) => this.completarAlumno(fila)),
    ]);
  }

  private async completarAuxiliar(fila: FilaAuxiliar) {
    const auxDoc = await this.leer("auxiliar", fila.id);
    if (!auxDoc) {
      return;
    }
    const personaDoc = await this.leer("persona", auxDoc.get("id_persona"));
    if (!personaDoc) {
      return;
    }
    this.zone.run(() => {
      fila.nombres = personaDoc.get("p_nombres");
      fila.apellidos = personaDoc.get("p_apellidos");
    });
  }

  private async completarAlumno(fila: FilaRoster) {
    const alumnoDoc = await this.leer("alumno", fila.id);
    if (!alumnoDoc) {
      return;
    }
    const personaDoc = await this.leer("persona", alumnoDoc.get("id_persona"));
    if (!personaDoc) {
      return;
    }
    this.zone.run(() => {
      fila.nombre =
        personaDoc.get("p_nombres") + " " + personaDoc.get("p_apellidos");
      fila.direccion = personaDoc.get("p_direccion");
    });
  }
  comenzarRuta() {
    const seleccionados = this.seleccionados;
    if (seleccionados.length === 0) {
      this.toast("seleccione alumnos para comenzar la ruta");
      return;
    }
    if (!this.bind) {
      this.toast("seleccione un auxiliar para comenzar");
      return;
    }

    // La persona del auxiliar no se guardaba, asi que la cabecera del
    // rastreo no podia nombrar a quien va a bordo. Se toma del chip ya
    // elegido y se guarda ANTES de navegar: dentro del callback de la
    // consulta llegaria tarde, porque router.navigate() de mas abajo se
    // ejecuta apenas se dispara la lectura, no cuando responde.
    const chip = this.auxiliares.find((a) => a.id === this.bind);
    if (chip) {
      this.dataService.setDataAuxiliarPersona({
        p_nombres: chip.nombres,
        p_apellidos: chip.apellidos,
      });
    }

    // Deliberadamente sin await: la navegacion de mas abajo no depende
    // de esta lectura (para eso esta el chip de arriba); solo deja el
    // documento del auxiliar disponible para las pantallas siguientes.
    this.leer("auxiliar", this.bind).then((doc) => {
      if (doc) {
        this.dataService.setDataAuxiliar(doc.data() as Auxiliar);
      }
    });

    this.dataService.setIdAuxiliar(this.bind);
    this.dataService.ids_alumnos = seleccionados.map((a) => a.id);
    this.dataService.nombres_alumnos = seleccionados.map((a) => a.nombre);

    // Se marca alu_estado solo para los alumnos realmente
    // seleccionados, no por indice de checkbox tocado (el array de
    // checkboxes era sparse y no reflejaba el estado real).
    //
    // El id del documento conductor/{uid} ES el uid de Firebase Auth
    // (ver firestore.rules), no un campo id_conductor dentro del doc
    // (ese campo no existe, doc(undefined) fallaba con
    // permission-denied en silencio).
    //
    // Las escrituras no se esperaban ni tenian .catch(), asi que un
    // fallo (sin conexion, reglas) quedaba como una promesa rechazada
    // suelta en la consola y el conductor arrancaba la ruta creyendo
    // que habia quedado registrada.
    const escrituras = [
      this.db.collection("auxiliar").doc(this.bind).update({ aux_estado: 1 }),
      this.db.collection("conductor").doc(this.uid).update({ con_estado: 1 }),
      ...seleccionados.map((alumno) =>
        this.db
          .collection("alumno")
          .doc(alumno.id)
          .update({ alu_estado: ALU_ESTADO.ABORDO })
      ),
    ];
    Promise.all(escrituras).catch(() =>
      this.toast("No se pudo registrar el inicio de la ruta.", "danger")
    );
    this.router.navigate(["/tabs-conductor/rastreo-conductor"]);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: "¿Desea cerrar sesión?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          handler: (a) => {},
        },
        {
          text: "Confirmar",
          handler: (b) => {
            this.AFA.signOut();
            this.router.navigate(["/home"]);
          },
        },
      ],
    });
    await alert.present();
  }

  async ayuda() {
    const modal = await this.modalController.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
