import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RastreoConductorPageRoutingModule } from './rastreo-conductor-routing.module';

import { RastreoConductorPage } from './rastreo-conductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RastreoConductorPageRoutingModule
  ],
  declarations: [RastreoConductorPage]
})
export class RastreoConductorPageModule {}
