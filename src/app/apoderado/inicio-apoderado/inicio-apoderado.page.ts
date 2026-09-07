import { Component, NgZone, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";

import { DatosService } from "../../servicios/datos.service";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { EditAlumnoPage } from "../edit-alumno/edit-alumno.page";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { ALU_ESTADO, Apoderado, Furgon, Persona } from "src/app/models/safechild.models";

// Una fila por alumno, ya resuelta: la tarjeta necesita el nombre
// (coleccion persona), la patente (coleccion furgon) y si va en ruta
// (alu_estado), datos que antes se pedian recien al pulsar "Rastrear".
interface FilaAlumno {
  id: string;
  nombre: string;
  patente: string;
  enRuta: boolean;
  // Se guarda aparte de enRuta porque no es su negacion: "no subio" y
  // "todavia no sale" son los dos "sin ruta", y al apoderado le importa
  // muchisimo la diferencia.
  noAbordo: boolean;
}

@Component({
  selector: "app-inicio-apoderado",
  templateUrl: "./inicio-apoderado.page.html",
  styleUrls: ["./inicio-apoderado.page.scss"],
})
export class InicioApoderadoPage implements OnInit {
  uid: string;
  alumnos: FilaAlumno[] = [];
  // Evita que "No hay alumnos asociados a su cuenta" aparezca mientras
  // la primera lectura sigue en curso.
  cargando = true;

  constructor(
    public AFA: AngularFireAuth,
    public router: Router,
    public db: AngularFirestore,
    public dataService: DatosService,
    public modalCtrl: ModalController,
    public alertController: AlertController,
    private toastController: ToastController,
    // Ver el comentario en getInfo() de inicio-conductor: las lecturas
    // que llegan con la pagina ya viva no disparan deteccion de cambios.
    private zone: NgZone
  ) {}

  private async toast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color: "medium",
    });
    toast.present();
  }

  ngOnInit() {
    // Ver inicio-conductor: al cerrar sesion authState emite null y
    // `res.uid !== null` reventaba al leer .uid de null.
    this.AFA.authState.forEach((res) => {
      if (res && res.uid) {
        this.uid = res.uid;
        this.getInfo();
      }
    });
  }

  /*
   * Lee un documento suelto.
   *
   * Concentra las dos precauciones que antes se repetian a mano en cada
   * nivel de las cadenas anidadas, y que era justamente donde se
   * colaban los errores:
   *
   *  - id vacio: doc(undefined) NO falla al construirse (Firestore lo
   *    toma como "genera un id nuevo"), y recien el get() se rechaza
   *    por reglas. Se corta antes para no disparar una lectura
   *    condenada por cada campo que falte.
   *  - error de lectura (permiso denegado, documento borrado): se avisa
   *    una sola vez y se devuelve null, para que la pantalla no quede a
   *    medio cargar en silencio.
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

  async editAlumno(id_alum: string) {
    if (!id_alum) {
      this.toast("seleccione un alumno para editar");
      return;
    }
    const alumnoDoc = await this.leer("alumno", id_alum);
    if (!alumnoDoc) {
      return;
    }
    // data() no trae el id del propio documento: se agrega aparte,
    // porque edit-alumno.page.ts y otras pantallas lo necesitan para
    // saber a que alumno/{id} escribir despues.
    this.dataService.setDataAlumno({
      ...(alumnoDoc.data() as any),
      id_alumno: alumnoDoc.id,
    });

    const [furgonDoc, personaDoc] = await Promise.all([
      this.leer("furgon", this.dataService.getDataAlumno().id_furgon),
      this.leer("persona", this.dataService.getDataAlumno().id_persona),
    ]);
    if (furgonDoc) {
      this.dataService.setdataFurgon(furgonDoc.data() as Furgon);
    }
    if (!personaDoc) {
      return;
    }
    this.dataService.setDataAlumnoPersona(personaDoc.data() as Persona);
    await this.goEdit();
  }

  async goEdit() {
    const modal = await this.modalCtrl.create({
      component: EditAlumnoPage,
      // El modal se presenta como hoja inferior: sin fondo propio, el
      // velo semitransparente de la pagina deja ver el inicio detras
      // (ver .sc-sheet-modal en global.scss).
      cssClass: "sc-sheet-modal",
      componentProps: {
        dataAlumno: this.dataService.getDataAlumno(),
        dataAlumnoPersona: this.dataService.getDataAlumnoPersona(),
      },
    });
    await modal.present();
  }

  /*
   * Los zone.run() se mantienen pese al async/await: getInfo() puede
   * arrancar desde authState, que emite FUERA de la zona de Angular, y
   * Zone.js captura la zona al registrar el await, no al resolverse, de
   * modo que las continuaciones tampoco quedan dentro. Sin esto los
   * datos llegan correctos a memoria pero la pantalla no se repinta.
   */
  async getInfo() {
    this.cargando = true;

    const apoderadoDoc = await this.leer("apoderado", this.uid);
    if (!apoderadoDoc) {
      this.zone.run(() => (this.cargando = false));
      return;
    }

    const ids: string[] = Object.values(apoderadoDoc.get("id_alumnos") || {});
    this.dataService.setDataApoderado(apoderadoDoc.data() as Apoderado);

    // El nombre del apoderado alimenta la cabecera y no lo necesita
    // ninguna fila: se lanza sin esperarlo para no retrasar la lista.
    this.leer("persona", apoderadoDoc.get("id_persona")).then((personaDoc) => {
      if (personaDoc) {
        this.zone.run(() =>
          this.dataService.setDataApoderadoPersona(personaDoc.data() as Persona)
        );
      }
    });

    // Se crean las filas de una vez y luego cada tarea rellena la suya:
    // asi el orden de las tarjetas sigue el de id_alumnos y no el de
    // llegada de las respuestas.
    //
    // authState puede emitir mas de una vez (refresco de token) y
    // reemplazar `alumnos` mientras las consultas de la pasada anterior
    // siguen en vuelo. Cada tarea se queda con SU fila por closure, asi
    // que una pasada vieja no puede escribir sobre la nueva.
    const filas: FilaAlumno[] = ids.map((id) => ({
      id,
      nombre: "",
      patente: "",
      enRuta: false,
      noAbordo: false,
    }));
    // Dentro de la zona: si el apoderado no tiene alumnos no va a correr
    // ninguna tarea de fila despues, y sin esto el estado vacio no
    // llegaba a pintarse al volver a la pestaña.
    this.zone.run(() => {
      this.alumnos = filas;
      this.cargando = false;
    });

    // Promise.all y no un for...of con await: las filas se resuelven en
    // paralelo, como hacian los callbacks. En serie serian N viajes de
    // ida y vuelta encadenados.
    await Promise.all(filas.map((fila) => this.completarFila(fila)));
  }

  private async completarFila(fila: FilaAlumno) {
    const alumnoDoc = await this.leer("alumno", fila.id);
    if (!alumnoDoc) {
      return;
    }
    const estado = alumnoDoc.get("alu_estado");
    this.zone.run(() => {
      fila.enRuta = estado == ALU_ESTADO.ABORDO;
      fila.noAbordo = estado == ALU_ESTADO.NO_ABORDO;
    });

    const [personaDoc, furgonDoc] = await Promise.all([
      this.leer("persona", alumnoDoc.get("id_persona")),
      this.leer("furgon", alumnoDoc.get("id_furgon")),
    ]);
    this.zone.run(() => {
      if (personaDoc) {
        fila.nombre =
          personaDoc.get("p_nombres") + " " + personaDoc.get("p_apellidos");
      }
      if (furgonDoc) {
        fila.patente = furgonDoc.get("fur_patente");
      }
    });
  }

  private avisandoErrorCarga = false;

  // Las cadenas de lecturas anidadas no tenian manejo de error: si algo
  // fallaba (permiso denegado, doc borrado), las tarjetas quedaban a
  // medio llenar sin avisar. El flag evita apilar un toast por cada
  // lectura que falle.
  private avisarErrorCarga() {
    if (this.avisandoErrorCarga) {
      return;
    }
    this.avisandoErrorCarga = true;
    this.toast("No se pudo cargar parte de la información. Intente de nuevo.");
    setTimeout(() => (this.avisandoErrorCarga = false), 3000);
  }

  // El saludo del header cambia con la hora: es el unico dato de la
  // cabecera que no viene de Firestore.
  get saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 20) return "Buenas tardes";
    return "Buenas noches";
  }

  async getInfoAlumno(id_alum: string) {
    if (!id_alum) {
      this.toast("seleccione un alumno para rastrear");
      return;
    }
    const alumnoDoc = await this.leer("alumno", id_alum);
    if (!alumnoDoc) {
      return;
    }

    const estado = alumnoDoc.get("alu_estado");
    if (estado == ALU_ESTADO.NO_ABORDO) {
      // Sin este caso el mensaje era "no se encuentra en ruta", que
      // suena a que todavia no sale y no a que el furgon ya paso sin el.
      this.toast("Su alumno no abordó el furgón en esta ruta");
      return;
    }
    if (estado != ALU_ESTADO.ABORDO) {
      this.toast("el alumno seleccionado no se encuentra en ruta");
      return;
    }

    // data() no trae el id del propio documento: sin esto,
    // getDataAlumno().id_alumno queda undefined, lo que hace que
    // RastreoApoderadoGuard bloquee SIEMPRE el acceso a
    // rastreo-apoderado (exige id_alumno truthy) y que la navegacion
    // mande a ".../rastreo-apoderado/undefined".
    this.dataService.setDataAlumno({
      ...(alumnoDoc.data() as any),
      id_alumno: alumnoDoc.id,
    });

    const [furgonDoc, personaDoc] = await Promise.all([
      this.leer("furgon", this.dataService.getDataAlumno().id_furgon),
      this.leer("persona", this.dataService.getDataAlumno().id_persona),
    ]);
    if (furgonDoc) {
      this.dataService.setdataFurgon(furgonDoc.data() as Furgon);
    }
    if (!personaDoc) {
      return;
    }
    this.dataService.setDataAlumnoPersona(personaDoc.data() as Persona);
    this.router.navigate([
      "/tabs-apoderado/rastreo-apoderado",
      this.dataService.getDataAlumno().id_alumno,
    ]);
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
    const modal = await this.modalCtrl.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
