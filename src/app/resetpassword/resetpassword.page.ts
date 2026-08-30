import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { ModalController, ToastController } from "@ionic/angular";

@Component({
  selector: "app-resetpassword",
  templateUrl: "./resetpassword.page.html",
  styleUrls: ["./resetpassword.page.scss"],
})
export class ResetpasswordPage implements OnInit {
  correo: string;

  constructor(
    private AFA: AngularFireAuth,
    private modalCtrl: ModalController,
    private toastController: ToastController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  private async toast(message: string, color: string = "medium") {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
    });
    toast.present();
  }

  resetPassword() {
    this.AFA.sendPasswordResetEmail(this.correo)
      .then(() => {
        this.toast("Correo enviado correctamente", "success");
      })
      .catch((err) => {
        if (err.code == "auth/user-not-found") {
          this.toast("Correo no encontrado en la aplicación", "danger");
        }
        if (err.code == "auth/argument-error") {
          this.toast("Inserte un correo valido", "danger");
        }
        if (err.code == "auth/invalid-email") {
          this.toast("Inserte un correo valido", "danger");
        }
        console.log(err.code);
      });
  }

  ngOnInit() {}
}
