import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-ayuda",
  templateUrl: "./ayuda.page.html",
  styleUrls: ["./ayuda.page.scss"],
})
export class AyudaPage {
  constructor(public modalController: ModalController) {}


  onClick() {
    this.modalController.dismiss();
  }
}
