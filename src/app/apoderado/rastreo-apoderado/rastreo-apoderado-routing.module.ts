import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RastreoApoderadoPage } from './rastreo-apoderado.page';

const routes: Routes = [
  {
    path: '',
    component: RastreoApoderadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RastreoApoderadoPageRoutingModule {}
