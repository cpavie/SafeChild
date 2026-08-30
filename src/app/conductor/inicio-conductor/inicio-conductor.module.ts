import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/components/shared.module';

import { InicioConductorPageRoutingModule } from './inicio-conductor-routing.module';

import { InicioConductorPage } from './inicio-conductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    InicioConductorPageRoutingModule
  ],
  declarations: [InicioConductorPage]
})
export class InicioConductorPageModule {}
