import { Component } from "@angular/core";
import { AuthService } from "../servicios/auth.service";
import { ModalController, ToastController } from "@ionic/angular";
import { ResetpasswordPage } from "../resetpassword/resetpassword.page";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  email: string;
  password: string;
  // El diseño muestra el rol siempre elegido (tarjeta activa), asi que
  // parte en apoderado en vez de undefined: sin esto la primera
  // tarjeta se veria seleccionada pero onSubmitLogin() reclamaria un
  // campo vacio.
  type = "apoderado";
  passwordShown = false;

  constructor(
    private authService: AuthService,
    private toast: ToastController,
    private modalCtrl: ModalController
  ) {}

  async goResetPassword() {
    const modal = await this.modalCtrl.create({
      component: ResetpasswordPage,
    });
    await modal.present();
  }

  async presentToast() {
    const toast = await this.toast.create({
      message: "Llene todos los campos.",
      duration: 2000,
    });
    toast.present();
  }

  onSubmitLogin() {
    if (this.type == null || this.password == null || this.email == null) {
      this.presentToast();
    } else {
      this.authService.login(this.email, this.password, this.type);
    }
  }
}
