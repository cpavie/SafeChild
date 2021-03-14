import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RastreoConductorPage } from './rastreo-conductor.page';

const routes: Routes = [
  {
    path: '',
    component: RastreoConductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RastreoConductorPageRoutingModule {}
