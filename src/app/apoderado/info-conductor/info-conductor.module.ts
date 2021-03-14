import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoConductorPageRoutingModule } from './info-conductor-routing.module';

import { InfoConductorPage } from './info-conductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoConductorPageRoutingModule
  ],
  declarations: [InfoConductorPage]
})
export class InfoConductorPageModule {}
