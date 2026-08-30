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
  alumnos_id: Array<any> = [];
  alumnos_nombres: Array<any> = [];
  alumnos_id_p: Array<any> = [];
  bind: string;
  apoderado_data: any = {};
  alumno_data: any = {};
  furgon_data: any = {};

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
        this.alumnos_id = Object.values(doc.get("id_alumnos"));
        this.dataService.setDataApoderado(doc.data() as Apoderado);
        this.db
          .collection("persona")
          .doc(doc.get("id_persona"))
          .get()
          .forEach((doc) => {
            this.dataService.setDataApoderadoPersona(doc.data() as Persona);
          });
        for (let i = 0; i < this.alumnos_id.length; i++) {
          this.db
            .collection("alumno")
            .doc(this.alumnos_id[i])
            .get()
            .forEach((doc) => {
              this.alumnos_id_p[i] = doc.get("id_persona");
              this.db
                .collection("persona")
                .doc(this.alumnos_id_p[i])
                .get()
                .forEach((doc) => {
                  this.alumnos_nombres[i] =
                    doc.get("p_nombres") + " " + doc.get("p_apellidos");
                });
            });
        }
      });
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
