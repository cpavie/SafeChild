import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/components/shared.module';

import { InfoFurgonPageRoutingModule } from './info-furgon-routing.module';

import { InfoFurgonPage } from './info-furgon.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    InfoFurgonPageRoutingModule
  ],
  declarations: [InfoFurgonPage]
})
export class InfoFurgonPageModule {}
