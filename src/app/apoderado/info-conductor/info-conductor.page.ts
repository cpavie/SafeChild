import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { DatosService } from "src/app/servicios/datos.service";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-info-conductor",
  templateUrl: "./info-conductor.page.html",
  styleUrls: ["./info-conductor.page.scss"],
})
export class InfoConductorPage implements OnInit {
  @Input() dataConductor;
  @Input() dataConductorPersona;
  img_licencia: string;

  constructor(
    public modalCtrl: ModalController,
    public dataService: DatosService,
    public db: AngularFirestore
  ) {}

  ngOnInit() {
    this.db
      .collection("licencia")
      .doc(this.dataConductor.id_licencia)
      .get()
      .forEach((doc) => {
        this.img_licencia = doc.get("lic_foto");
      });
  }

  // `ir` viaja de vuelta a rastreo-apoderado, que abre el modal de la
  // pestaña pedida. Cambiar de pestaña aqui mismo obligaria a que esta
  // pantalla cargara tambien los datos de auxiliar y furgon.
  dismiss(ir?: "conductor" | "auxiliar" | "furgon") {
    this.modalCtrl.dismiss(ir ? { ir } : undefined);
  }
}
