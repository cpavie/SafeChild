import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { DatosService } from "src/app/servicios/datos.service";

@Component({
  selector: "app-info-furgon",
  templateUrl: "./info-furgon.page.html",
  styleUrls: ["./info-furgon.page.scss"],
})
export class InfoFurgonPage implements OnInit {
  @Input() dataFurgon;
  constructor(
    private modalCtrl: ModalController,
    public dataService: DatosService
  ) {}

  ngOnInit() {}

  // Ver info-conductor.page.ts: la pestaña pedida se resuelve en
  // rastreo-apoderado, que es quien tiene los datos de las tres.
  dismiss(ir?: "conductor" | "auxiliar" | "furgon") {
    this.modalCtrl.dismiss(ir ? { ir } : undefined);
  }
}
