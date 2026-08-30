import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/components/shared.module';

import { InicioApoderadoPageRoutingModule } from './inicio-apoderado-routing.module';

import { InicioApoderadoPage } from './inicio-apoderado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    InicioApoderadoPageRoutingModule
  ],
  declarations: [InicioApoderadoPage]
})
export class InicioApoderadoPageModule {}
