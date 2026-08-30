import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { DatosService } from "src/app/servicios/datos.service";
import { Auxiliar, Conductor, Furgon, Persona } from "src/app/models/safechild.models";

@Component({
  selector: "app-inicio-conductor",
  templateUrl: "./inicio-conductor.page.html",
  styleUrls: ["./inicio-conductor.page.scss"],
})
export class InicioConductorPage implements OnInit {
  uid: string;
  // La seleccion vive en la propia fila (`on`) en vez de en tres arrays
  // paralelos (ids / nombres / checkboxes) que antes podian
  // desincronizarse entre si.
  roster: Array<{
    id: string;
    nombre: string;
    direccion: string;
    on: boolean;
  }> = [];
  auxiliares: Array<{ id: string; nombre: string }> = [];
  bind: string;

  constructor(
    public AFA: AngularFireAuth,
    private db: AngularFirestore,
    public dataService: DatosService,
    public router: Router,
    public alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
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
    this.AFA.authState.forEach((res) => {
      if (res.uid !== null) {
        this.uid = res.uid;
        this.getInfo();
      }
    });
  }

  get seleccionados() {
    return this.roster.filter((alumno) => alumno.on);
  }

  get puedeComenzar(): boolean {
    return this.seleccionados.length > 0 && !!this.bind;
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
    this.toast("No se pudo cargar parte de la información. Intente de nuevo.", "danger");
    this.avisandoErrorCarga = false;
  }

  getInfo() {
    this.db
      .collection("conductor")
      .doc(this.uid)
      .get()
      .forEach((doc) => {
        this.dataService.setDataConductor(doc.data() as Conductor);
        this.db
          .collection("persona")
          .doc(this.dataService.getDataConductor().id_persona)
          .get()
          .forEach((doc) => {
            this.dataService.setDataConductorPersona(doc.data() as Persona);
            this.db
              .collection("furgon")
              .doc(this.dataService.getDataConductor().id_furgon)
              .get()
              .forEach((doc) => {
                this.dataService.setdataFurgon(doc.data() as Furgon);

                const idsAuxiliares: string[] = Object.values(
                  doc.get("auxiliares") || {}
                );
                this.auxiliares = idsAuxiliares.map((id) => ({ id, nombre: "" }));
                idsAuxiliares.forEach((id, i) => {
                  this.db
                    .collection("auxiliar")
                    .doc(id)
                    .get()
                    .forEach((auxDoc) => {
                      this.db
                        .collection("persona")
                        .doc(auxDoc.get("id_persona"))
                        .get()
                        .forEach((personaDoc) => {
                          this.auxiliares[i].nombre =
                            personaDoc.get("p_nombres") +
                            " " +
                            personaDoc.get("p_apellidos");
                        })
                        .catch(() => this.avisarErrorCarga());
                    })
                    .catch(() => this.avisarErrorCarga());
                });

                const idsAlumnos: string[] = Object.values(
                  doc.get("alumnos") || {}
                );
                this.roster = idsAlumnos.map((id) => ({
                  id,
                  nombre: "",
                  direccion: "",
                  on: false,
                }));
                idsAlumnos.forEach((id, i) => {
                  this.db
                    .collection("alumno")
                    .doc(id)
                    .get()
                    .forEach((alumnoDoc) => {
                      this.db
                        .collection("persona")
                        .doc(alumnoDoc.get("id_persona"))
                        .get()
                        .forEach((personaDoc) => {
                          this.roster[i].nombre =
                            personaDoc.get("p_nombres") +
                            " " +
                            personaDoc.get("p_apellidos");
                          this.roster[i].direccion = personaDoc.get("p_direccion");
                        })
                        .catch(() => this.avisarErrorCarga());
                    })
                    .catch(() => this.avisarErrorCarga());
                });
              })
              .catch(() => this.avisarErrorCarga());
          })
          .catch(() => this.avisarErrorCarga());
      })
      .catch(() => this.avisarErrorCarga());
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

    this.db
      .collection("auxiliar")
      .doc(this.bind)
      .get()
      .forEach((doc) => {
        this.dataService.setDataAuxiliar(doc.data() as Auxiliar);
        // La persona del auxiliar no se guardaba, asi que la cabecera
        // del rastreo no podia nombrar a quien va a bordo. El nombre ya
        // esta resuelto en el chip elegido: se reusa en vez de pedir
        // otra vez la persona a Firestore.
        const chip = this.auxiliares.find((a) => a.id === this.bind);
        if (chip) {
          const [nombres, ...apellidos] = chip.nombre.split(" ");
          this.dataService.setDataAuxiliarPersona({
            p_nombres: nombres,
            p_apellidos: apellidos.join(" "),
          });
        }
      });
    this.db.collection("auxiliar").doc(this.bind).update({
      aux_estado: 1,
    });
    this.dataService.setIdAuxiliar(this.bind);
    this.dataService.ids_alumnos = seleccionados.map((a) => a.id);
    this.dataService.nombres_alumnos = seleccionados.map((a) => a.nombre);
    // Se marca alu_estado solo para los alumnos realmente
    // seleccionados, no por indice de checkbox tocado (el array de
    // checkboxes era sparse y no reflejaba el estado real).
    for (const alumno of seleccionados) {
      this.db.collection("alumno").doc(alumno.id).update({
        alu_estado: 1,
      });
    }
    // El id del documento conductor/{uid} ES el uid de Firebase
    // Auth (ver firestore.rules), no un campo id_conductor dentro
    // del doc (ese campo no existe, doc(undefined) fallaba con
    // permission-denied en silencio).
    this.db.collection("conductor").doc(this.uid).update({
      con_estado: 1,
    });
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
