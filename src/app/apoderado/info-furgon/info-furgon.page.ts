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

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
