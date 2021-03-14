import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoAuxiliarPageRoutingModule } from './info-auxiliar-routing.module';

import { InfoAuxiliarPage } from './info-auxiliar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoAuxiliarPageRoutingModule
  ],
  declarations: [InfoAuxiliarPage]
})
export class InfoAuxiliarPageModule {}
