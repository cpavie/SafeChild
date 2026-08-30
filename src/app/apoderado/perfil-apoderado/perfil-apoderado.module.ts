import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/components/shared.module';

import { PerfilApoderadoPageRoutingModule } from './perfil-apoderado-routing.module';

import { PerfilApoderadoPage } from './perfil-apoderado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    PerfilApoderadoPageRoutingModule
  ],
  declarations: [PerfilApoderadoPage]
})
export class PerfilApoderadoPageModule {}
