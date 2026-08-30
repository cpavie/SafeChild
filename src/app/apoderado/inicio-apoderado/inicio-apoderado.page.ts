import { Component, OnInit } from "@angular/core";
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

  constructor(
    public AFA: AngularFireAuth,
    public router: Router,
    public db: AngularFirestore,
    public dataService: DatosService,
    public modalCtrl: ModalController,
    public alertController: AlertController,
    private toastController: ToastController
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
          });

        // Se crean las filas de una vez y luego cada consulta rellena la
        // suya por indice: asi el orden de las tarjetas sigue el de
        // id_alumnos y no el de llegada de las respuestas.
        this.alumnos = ids.map((id) => ({
          id,
          nombre: "",
          patente: "",
          enRuta: false,
        }));

        ids.forEach((id, i) => {
          this.db
            .collection("alumno")
            .doc(id)
            .get()
            .forEach((alumnoDoc) => {
              this.alumnos[i].enRuta = alumnoDoc.get("alu_estado") == 1;
              this.db
                .collection("persona")
                .doc(alumnoDoc.get("id_persona"))
                .get()
                .forEach((personaDoc) => {
                  this.alumnos[i].nombre =
                    personaDoc.get("p_nombres") +
                    " " +
                    personaDoc.get("p_apellidos");
                });
              this.db
                .collection("furgon")
                .doc(alumnoDoc.get("id_furgon"))
                .get()
                .forEach((furgonDoc) => {
                  this.alumnos[i].patente = furgonDoc.get("fur_patente");
                });
            });
        });
      });
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
