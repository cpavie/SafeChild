import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/components/shared.module';

import { EditAlumnoPageRoutingModule } from './edit-alumno-routing.module';

import { EditAlumnoPage } from './edit-alumno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    EditAlumnoPageRoutingModule
  ],
  declarations: [EditAlumnoPage]
})
export class EditAlumnoPageModule {}
