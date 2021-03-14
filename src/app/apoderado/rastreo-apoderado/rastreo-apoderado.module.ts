import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RastreoApoderadoPageRoutingModule } from './rastreo-apoderado-routing.module';

import { RastreoApoderadoPage } from './rastreo-apoderado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RastreoApoderadoPageRoutingModule
  ],
  declarations: [RastreoApoderadoPage]
})
export class RastreoApoderadoPageModule {}
