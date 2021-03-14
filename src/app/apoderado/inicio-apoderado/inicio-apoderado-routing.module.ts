import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioApoderadoPage } from './inicio-apoderado.page';

const routes: Routes = [
  {
    path: '',
    component: InicioApoderadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioApoderadoPageRoutingModule {}
