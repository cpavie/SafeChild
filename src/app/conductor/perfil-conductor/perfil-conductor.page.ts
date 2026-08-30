import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import {
  AlertController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { ResetpasswordPage } from "src/app/resetpassword/resetpassword.page";
import { DatosService } from "src/app/servicios/datos.service";
import { Conductor, Furgon, Persona } from "src/app/models/safechild.models";

@Component({
  selector: "app-perfil-conductor",
  templateUrl: "./perfil-conductor.page.html",
  styleUrls: ["./perfil-conductor.page.scss"],
})
export class PerfilConductorPage implements OnInit, OnDestroy {
  constructor(
    public dataService: DatosService,
    public alertController: AlertController,
    public db: AngularFirestore,
    public toastController: ToastController,
    public AFA: AngularFireAuth,
    public router: Router,
    private modalController: ModalController
  ) {}

  comuna: string;
  telefono: number;
  direccion: string;
  uid: string;
  // Confirmacion en linea bajo los botones (ver .sc-inline-toast).
  guardado = false;
  private guardadoTimer: any;

  ngOnInit() {}

  // Se recarga desde Firestore (no solo desde el servicio en memoria)
  // porque un F5 en esta pagina deja dataService vacio: guardar en
  // ese estado sobreescribiria datos reales con undefined.
  async ionViewWillEnter() {
    const user = await this.AFA.currentUser;
    if (!user) {
      return;
    }
    // El id del documento conductor/{uid} ES el uid de Firebase Auth
    // (ver firestore.rules), no un campo id_conductor dentro del doc.
    this.uid = user.uid;

    try {
      const conductorDoc = await this.db
        .collection("conductor")
        .doc(this.uid)
        .get()
        .toPromise();
      const conductorData = (conductorDoc.data() || {}) as Conductor;
      this.dataService.setDataConductor(conductorData);
      this.telefono = conductorData.con_telefono;

      if (conductorData.id_persona) {
        const personaDoc = await this.db
          .collection("persona")
          .doc(conductorData.id_persona)
          .get()
          .toPromise();
        const personaData = (personaDoc.data() || {}) as Persona;
        this.dataService.setDataConductorPersona(personaData);
        this.comuna = personaData.p_comuna;
        this.direccion = personaData.p_direccion;
      }

      // El furgon asignado se muestra en esta pantalla, asi que se
      // carga aqui tambien: tras un F5 el servicio en memoria esta
      // vacio y la tarjeta quedaria sin patente ni capacidad.
      if (conductorData.id_furgon) {
        const furgonDoc = await this.db
          .collection("furgon")
          .doc(conductorData.id_furgon)
          .get()
          .toPromise();
        this.dataService.setdataFurgon((furgonDoc.data() || {}) as Furgon);
      }
    } catch (err) {
      const toast = await this.toastController.create({
        message: "No se pudo cargar el perfil. Intente de nuevo.",
        duration: 3000,
        color: "danger",
      });
      toast.present();
    }
  }

  async save() {
    const alert = await this.alertController.create({
      header: "¿Desea guardar los cambios?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          handler: (a) => {},
        },
        {
          text: "Confirmar",
          handler: (b) => {
            this.db
              .collection("conductor")
              .doc(this.uid)
              .update({
                con_telefono: this.telefono,
              })
              .catch((err) => console.log(err));
            this.db
              .collection("persona")
              .doc(this.dataService.getDataConductor().id_persona)
              .update({
                p_direccion: this.direccion,
                p_comuna: this.comuna,
              })
              .catch((err) => console.log(err));
            this.toast();
          },
        },
      ],
    });
    await alert.present();
  }
  toast() {
    this.guardado = true;
    clearTimeout(this.guardadoTimer);
    this.guardadoTimer = setTimeout(() => (this.guardado = false), 2500);
  }

  ngOnDestroy() {
    clearTimeout(this.guardadoTimer);
  }

  async goResetPassword() {
    const modal = await this.modalController.create({
      component: ResetpasswordPage,
    });
    await modal.present();
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
  cancel() {
    this.ionViewWillEnter();
  }
  async ayuda() {
    const modal = await this.modalController.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
