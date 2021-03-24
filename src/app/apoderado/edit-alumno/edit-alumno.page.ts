import { Component, Input, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  AlertController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import { DatosService } from "src/app/servicios/datos.service";

@Component({
  selector: "app-edit-alumno",
  templateUrl: "./edit-alumno.page.html",
  styleUrls: ["./edit-alumno.page.scss"],
})
export class EditAlumnoPage implements OnInit {
  @Input() dataAlumno;
  @Input() dataAlumnoPersona;

  constructor(
    public dataService: DatosService,
    public modalCtrl: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    public db: AngularFirestore
  ) {}
  comentario: string;
  comuna: string;
  direccion: string;

  ngOnInit() {
    this.direccion = this.dataAlumnoPersona.p_direccion;
    this.comentario = this.dataAlumno.alu_comentario;
    this.comuna = this.dataAlumnoPersona.p_comuna;
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
              .collection("alumno")
              .doc(this.dataAlumno.id_alumno)
              .update({
                alu_comentario: this.comentario,
              })
              .catch((err) => console.log(err));
            this.db
              .collection("persona")
              .doc(this.dataAlumno.id_persona)
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

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
