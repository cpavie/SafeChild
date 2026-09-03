import { Component, NgZone, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";

import { DatosService } from "../../servicios/datos.service";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { EditAlumnoPage } from "../edit-alumno/edit-alumno.page";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { Apoderado, Furgon, Persona } from "src/app/models/safechild.models";

@Component({
  selector: "app-inicio-apoderado",
  templateUrl: "./inicio-apoderado.page.html",
  styleUrls: ["./inicio-apoderado.page.scss"],
})
export class InicioApoderadoPage implements OnInit {
  uid: string;
  // Una fila por alumno, ya resuelta: la tarjeta necesita el nombre
  // (coleccion persona), la patente (coleccion furgon) y si va en ruta
  // (alu_estado), datos que antes se pedian recien al pulsar "Rastrear".
  alumnos: Array<{
    id: string;
    nombre: string;
    patente: string;
    enRuta: boolean;
  }> = [];
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
    this.AFA.authState.forEach((res) => {
      if (res.uid !== null) {
        this.uid = res.uid;
        this.getInfo();
      }
    });
  }

  editAlumno(id_alum: string) {
    if (id_alum == null) {
      this.toast("seleccione un alumno para editar");
    } else
      this.db
        .collection("alumno")
        .doc(id_alum)
        .get()
        .forEach((doc) => {
          // doc.data() no trae el id del propio documento: se agrega
          // aparte, porque edit-alumno.page.ts y otras pantallas lo
          // necesitan para saber a que alumno/{id} escribir despues.
          this.dataService.setDataAlumno({ ...(doc.data() as any), id_alumno: doc.id });
          this.db
            .collection("furgon")
            .doc(this.dataService.getDataAlumno().id_furgon)
            .get()
            .forEach((doc) => {
              this.dataService.setdataFurgon(doc.data() as Furgon);
            });
          this.db
            .collection("persona")
            .doc(this.dataService.getDataAlumno().id_persona)
            .get()
            .forEach((doc) => {
              this.dataService.setDataAlumnoPersona(doc.data() as Persona);
              this.goEdit();
            });
        });
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

  getInfo() {
    this.cargando = true;
    this.db
      .collection("apoderado")
      .doc(this.uid)
      .get()
      .forEach((doc) => {
        const ids: string[] = Object.values(doc.get("id_alumnos") || {});
        this.dataService.setDataApoderado(doc.data() as Apoderado);
        this.db
          .collection("persona")
          .doc(doc.get("id_persona"))
          .get()
          .forEach((doc) => {
            this.dataService.setDataApoderadoPersona(doc.data() as Persona);
          })
          .catch(() => this.avisarErrorCarga());

        // Se crean las filas de una vez y luego cada consulta rellena la
        // suya por indice: asi el orden de las tarjetas sigue el de
        // id_alumnos y no el de llegada de las respuestas.
        //
        // authState puede emitir mas de una vez (refresco de token), y
        // entonces `alumnos` se reemplaza mientras las consultas de la
        // pasada anterior siguen en vuelo. Cada callback se queda con
        // una referencia a SU array y comprueba que la fila siga siendo
        // la del mismo alumno antes de escribirla; si no, ya es de otra
        // pasada y se descarta.
        const filas = ids.map((id) => ({
          id,
          nombre: "",
          patente: "",
          enRuta: false,
        }));
        this.alumnos = filas;
        this.cargando = false;

        ids.forEach((id, i) => {
          const fila = filas[i];
          this.db
            .collection("alumno")
            .doc(id)
            .get()
            .forEach((alumnoDoc) => {
              this.zone.run(() => {
                fila.enRuta = alumnoDoc.get("alu_estado") == 1;
              });

              // doc(undefined) no falla al construirse: Firestore lo
              // toma como "genera un id nuevo", y recien el get() se
              // rechaza por reglas. Se corta antes para no disparar una
              // lectura condenada por cada campo que falte.
              const idPersona = alumnoDoc.get("id_persona");
              if (idPersona) {
                this.db
                  .collection("persona")
                  .doc(idPersona)
                  .get()
                  .forEach((personaDoc) => {
                    this.zone.run(() => {
                      fila.nombre =
                        personaDoc.get("p_nombres") +
                        " " +
                        personaDoc.get("p_apellidos");
                    });
                  })
                  .catch(() => this.avisarErrorCarga());
              }

              const idFurgon = alumnoDoc.get("id_furgon");
              if (idFurgon) {
                this.db
                  .collection("furgon")
                  .doc(idFurgon)
                  .get()
                  .forEach((furgonDoc) => {
                    this.zone.run(() => {
                      fila.patente = furgonDoc.get("fur_patente");
                    });
                  })
                  .catch(() => this.avisarErrorCarga());
              }
            })
            .catch(() => this.avisarErrorCarga());
        });
      })
      .catch(() => {
        this.cargando = false;
        this.avisarErrorCarga();
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

  getInfoAlumno(id_alum: string) {
    if (id_alum == null) {
      this.toast("seleccione un alumno para rastrear");
    } else
      this.db
        .collection("alumno")
        .doc(id_alum)
        .get()
        .forEach((doc) => {
          if (doc.get("alu_estado") == 1) {
            // doc.data() no trae el id del propio documento: sin esto,
            // getDataAlumno().id_alumno queda undefined, lo que hace
            // que RastreoApoderadoGuard bloquee SIEMPRE el acceso a
            // rastreo-apoderado (exige id_alumno truthy) y que la
            // navegacion mande a ".../rastreo-apoderado/undefined".
            this.dataService.setDataAlumno({ ...(doc.data() as any), id_alumno: doc.id });
            this.db
              .collection("furgon")
              .doc(this.dataService.getDataAlumno().id_furgon)
              .get()
              .forEach((doc) => {
                this.dataService.setdataFurgon(doc.data() as Furgon);
              });
            this.db
              .collection("persona")
              .doc(this.dataService.getDataAlumno().id_persona)
              .get()
              .forEach((doc) => {
                this.dataService.setDataAlumnoPersona(doc.data() as Persona);
                this.router.navigate([
                  "/tabs-apoderado/rastreo-apoderado",
                  this.dataService.getDataAlumno().id_alumno,
                ]);
              });
          } else {
            this.toast("el alumno seleccionado no se encuentra en ruta");
          }
        });
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
