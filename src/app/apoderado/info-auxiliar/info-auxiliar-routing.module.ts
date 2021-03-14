import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoAuxiliarPage } from './info-auxiliar.page';

const routes: Routes = [
  {
    path: '',
    component: InfoAuxiliarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoAuxiliarPageRoutingModule {}
