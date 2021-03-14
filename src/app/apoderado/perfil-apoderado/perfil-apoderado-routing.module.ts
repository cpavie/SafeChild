import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilApoderadoPage } from './perfil-apoderado.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilApoderadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilApoderadoPageRoutingModule {}
