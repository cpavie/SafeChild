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
  // nombres y apellidos se guardan por separado, no concatenados: el
  // rastreo necesita la Persona con sus dos campos, y volver a partir
  // un "nombre completo" por el primer espacio rompe cualquier nombre
  // compuesto ("Ana María Soto Rojas" daria p_nombres "Ana").
  auxiliares: Array<{ id: string; nombres: string; apellidos: string }> = [];
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
                // Cada callback se queda con SU fila (no con el indice
                // dentro del array actual): authState puede emitir de
                // nuevo y reemplazar el array mientras estas consultas
                // siguen en vuelo, y escribir por indice reventaria con
                // "cannot set property of undefined".
                const filasAux = idsAuxiliares.map((id) => ({
                  id,
                  nombres: "",
                  apellidos: "",
                }));
                this.auxiliares = filasAux;
                idsAuxiliares.forEach((id, i) => {
                  const fila = filasAux[i];
                  this.db
                    .collection("auxiliar")
                    .doc(id)
                    .get()
                    .forEach((auxDoc) => {
                      const idPersona = auxDoc.get("id_persona");
                      if (!idPersona) {
                        return;
                      }
                      this.db
                        .collection("persona")
                        .doc(idPersona)
                        .get()
                        .forEach((personaDoc) => {
                          fila.nombres = personaDoc.get("p_nombres");
                          fila.apellidos = personaDoc.get("p_apellidos");
                        })
                        .catch(() => this.avisarErrorCarga());
                    })
                    .catch(() => this.avisarErrorCarga());
                });

                const idsAlumnos: string[] = Object.values(
                  doc.get("alumnos") || {}
                );
                const filasRoster = idsAlumnos.map((id) => ({
                  id,
                  nombre: "",
                  direccion: "",
                  on: false,
                }));
                this.roster = filasRoster;
                idsAlumnos.forEach((id, i) => {
                  const fila = filasRoster[i];
                  this.db
                    .collection("alumno")
                    .doc(id)
                    .get()
                    .forEach((alumnoDoc) => {
                      const idPersona = alumnoDoc.get("id_persona");
                      if (!idPersona) {
                        return;
                      }
                      this.db
                        .collection("persona")
                        .doc(idPersona)
                        .get()
                        .forEach((personaDoc) => {
                          fila.nombre =
                            personaDoc.get("p_nombres") +
                            " " +
                            personaDoc.get("p_apellidos");
                          fila.direccion = personaDoc.get("p_direccion");
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

    this.db
      .collection("auxiliar")
      .doc(this.bind)
      .get()
      .forEach((doc) => {
        this.dataService.setDataAuxiliar(doc.data() as Auxiliar);
      })
      .catch(() => this.avisarErrorCarga());
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
