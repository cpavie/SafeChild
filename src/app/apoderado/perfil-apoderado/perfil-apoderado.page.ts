import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { DatosService } from "../../servicios/datos.service";
import {
  AlertController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import { AyudaPage } from "src/app/ayuda/ayuda.page";
import { ResetpasswordPage } from "src/app/resetpassword/resetpassword.page";
import { Apoderado, Persona } from "src/app/models/safechild.models";
import { ThemeService } from "src/app/servicios/theme.service";

@Component({
  selector: "app-perfil-apoderado",
  templateUrl: "./perfil-apoderado.page.html",
  styleUrls: ["./perfil-apoderado.page.scss"],
})
export class PerfilApoderadoPage implements OnInit {
  constructor(
    public AFA: AngularFireAuth,
    public router: Router,
    public db: AngularFirestore,
    public dataService: DatosService,
    public alertController: AlertController,
    public toastController: ToastController,
    private modalController: ModalController,
    private themeService: ThemeService
  ) {}

  telefono: number;
  comuna: string;
  direccion: string;
  uid: string;

  get isDark(): boolean {
    return this.themeService.isDark();
  }

  onThemeToggle(event: CustomEvent) {
    this.themeService.setMode(event.detail.checked ? "dark" : "light");
  }

  ngOnInit() {}

  // Se recarga desde Firestore (no solo desde el servicio en memoria)
  // porque un F5 en esta pagina deja dataService vacio: guardar en
  // ese estado sobreescribiria datos reales con undefined.
  async ionViewWillEnter() {
    const user = await this.AFA.currentUser;
    if (!user) {
      return;
    }
    // El id del documento apoderado/{uid} ES el uid de Firebase Auth
    // (ver firestore.rules), no un campo id_apoderado dentro del doc.
    this.uid = user.uid;

    try {
      const apoderadoDoc = await this.db
        .collection("apoderado")
        .doc(this.uid)
        .get()
        .toPromise();
      const apoderadoData = (apoderadoDoc.data() || {}) as Apoderado;
      this.dataService.setDataApoderado(apoderadoData);
      this.telefono = apoderadoData.apo_telefono;

      if (apoderadoData.id_persona) {
        const personaDoc = await this.db
          .collection("persona")
          .doc(apoderadoData.id_persona)
          .get()
          .toPromise();
        const personaData = (personaDoc.data() || {}) as Persona;
        this.dataService.setDataApoderadoPersona(personaData);
        this.comuna = personaData.p_comuna;
        this.direccion = personaData.p_direccion;
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
              .collection("apoderado")
              .doc(this.uid)
              .update({
                apo_telefono: this.telefono,
              })
              .catch((err) => console.log(err));
            this.db
              .collection("persona")
              .doc(this.dataService.getDataApoderado().id_persona)
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
  async toast() {
    const toast = await this.toastController.create({
      header: "Datos guardados",
      duration: 2000,
    });
    toast.present();
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

  reset() {
    this.ionViewWillEnter();
  }

  async ayuda() {
    const modal = await this.modalController.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
