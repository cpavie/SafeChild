import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { DatosConductorService } from "src/app/servicios/datos-conductor.service";

@Component({
  selector: "app-inicio-conductor",
  templateUrl: "./inicio-conductor.page.html",
  styleUrls: ["./inicio-conductor.page.scss"],
})
export class InicioConductorPage implements OnInit {
  uid: string;
  id_alumnos: Array<any> = [];
  id_alumnos_p: Array<any> = [];
  alumnos_nombres: Array<any> = [];
  alumnos_select: Array<any> = [];
  alums: Array<any> = [];
  id_auxiliares: Array<any> = [];
  id_auxiliares_p: Array<any> = [];
  auxiliares_nombres: Array<any> = [];
  bind: string;
  al_nombres = [];
  al_ids = [];

  constructor(
    public AFA: AngularFireAuth,
    private db: AngularFirestore,
    public dataService: DatosConductorService,
    public router: Router,
    public alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.AFA.authState.forEach((res) => {
      if (res.uid !== null) {
        this.uid = res.uid;
        this.getInfo();
      }
    });
  }

  dataAlum(a, b) {
    if (this.al_ids.includes(a)) {
      this.al_nombres = this.al_nombres.filter((value) => value != b);
      this.al_ids = this.al_ids.filter((value) => value != a);
    } else {
      this.al_nombres.push(b);
      this.al_ids.push(a);
    }
  }

  getInfo() {
    this.db
      .collection("conductor")
      .doc(this.uid)
      .get()
      .forEach((doc) => {
        this.dataService.setDataConductor(doc.data());
        this.db
          .collection("persona")
          .doc(this.dataService.getDataConductor().id_persona)
          .get()
          .forEach((doc) => {
            this.dataService.setDataConductorPersona(doc.data());
            this.db
              .collection("furgon")
              .doc(this.dataService.getDataConductor().id_furgon)
              .get()
              .forEach((doc) => {
                this.dataService.setdataFurgon(doc.data());
                this.id_auxiliares = Object.values(doc.get("auxiliares"));
                for (let i = 0; i < this.id_auxiliares.length; i++) {
                  this.db
                    .collection("auxiliar")
                    .doc(this.id_auxiliares[i])
                    .get()
                    .forEach((doc) => {
                      this.id_auxiliares_p[i] = doc.get("id_persona");
                      this.db
                        .collection("persona")
                        .doc(this.id_auxiliares_p[i])
                        .get()
                        .forEach((doc) => {
                          this.auxiliares_nombres[i] = doc.get("p_nombres");
                        });
                    });
                }
                this.id_alumnos = Object.values(doc.get("alumnos"));
                for (let i = 0; i < this.id_alumnos.length; i++) {
                  this.db
                    .collection("alumno")
                    .doc(this.id_alumnos[i])
                    .get()
                    .forEach((doc) => {
                      this.id_alumnos_p[i] = doc.get("id_persona");
                      this.db
                        .collection("persona")
                        .doc(this.id_alumnos_p[i])
                        .get()
                        .forEach((doc) => {
                          this.alumnos_nombres[i] = doc.get("p_nombres");
                        });
                    });
                }
              });
          });
      });
  }
  comenzarRuta() {
    if (this.al_ids.length > 0) {
      if (this.bind) {
        for (let i = 0; i < this.alums.length; i++) {
          this.db
            .collection("auxiliar")
            .doc(this.bind)
            .get()
            .forEach((doc) => {
              this.dataService.setDataAuxiliar(doc.data());
            });
          this.db.collection("auxiliar").doc(this.bind).update({
            aux_estado: 1,
          });
          this.dataService.ids_alumnos = this.al_ids;
          this.dataService.nombres_alumnos = this.al_nombres;
          this.db.collection("alumno").doc(this.id_alumnos[i]).update({
            alu_estado: 1,
          });
        }
        this.db
          .collection("conductor")
          .doc(this.dataService.getDataConductor().id_conductor)
          .update({
            con_estado: 1,
          });
        this.router.navigate(["tabs-conductor/rastreo-conductor"]);
      } else {
        alert("seleccione un auxiliar para comenzar");
      }
    } else {
      alert("seleccione alumnos para comenzar la ruta");
    }
    if (this.alums.length < this.dataService.ids_alumnos.length) {
      this.dataService.ids_alumnos.length = 0;
    }
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
