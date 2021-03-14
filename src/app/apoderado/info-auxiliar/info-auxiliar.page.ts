import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatosService } from 'src/app/servicios/datos.service';

@Component({
  selector: 'app-info-auxiliar',
  templateUrl: './info-auxiliar.page.html',
  styleUrls: ['./info-auxiliar.page.scss'],
})
export class InfoAuxiliarPage implements OnInit {
  @Input() dataAux
  @Input() dataAuxPersona
  constructor(public dataService: DatosService, public modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.dataAux);
    console.log(this.dataAuxPersona);
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

}
