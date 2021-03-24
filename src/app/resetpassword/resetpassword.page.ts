import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-resetpassword",
  templateUrl: "./resetpassword.page.html",
  styleUrls: ["./resetpassword.page.scss"],
})
export class ResetpasswordPage implements OnInit {
  correo: string;

  constructor(
    private AFA: AngularFireAuth,
    private modalCtrl: ModalController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  resetPassword() {
    this.AFA.sendPasswordResetEmail(this.correo)
      .then(function () {
        alert("Correo enviado correctamente");
      })
      .catch(async function (err) {
        if (err.code == "auth/user-not-found") {
          alert("Correo no encontrado en la aplicación");
        }
        if (err.code == "auth/argument-error") {
          alert("Inserte un correo valido");
        }
        if (err.code == "auth/invalid-email") {
          alert("Inserte un correo valido");
        }
        console.log(err.code);
      });
  }

  ngOnInit() {}
}
