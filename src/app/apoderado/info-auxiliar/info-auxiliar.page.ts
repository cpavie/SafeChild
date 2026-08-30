import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { DatosService } from "src/app/servicios/datos.service";

@Component({
  selector: "app-info-auxiliar",
  templateUrl: "./info-auxiliar.page.html",
  styleUrls: ["./info-auxiliar.page.scss"],
})
export class InfoAuxiliarPage implements OnInit {
  @Input() dataAux;
  @Input() dataAuxPersona;
  constructor(
    public dataService: DatosService,
    public modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  // Ver info-conductor.page.ts: la pestaña pedida se resuelve en
  // rastreo-apoderado, que es quien tiene los datos de las tres.
  dismiss(ir?: "conductor" | "auxiliar" | "furgon") {
    this.modalCtrl.dismiss(ir ? { ir } : undefined);
  }
}
