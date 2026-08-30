import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/components/shared.module';

import { RastreoApoderadoPageRoutingModule } from './rastreo-apoderado-routing.module';

import { RastreoApoderadoPage } from './rastreo-apoderado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RastreoApoderadoPageRoutingModule
  ],
  declarations: [RastreoApoderadoPage]
})
export class RastreoApoderadoPageModule {}
