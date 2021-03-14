import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoFurgonPage } from './info-furgon.page';

const routes: Routes = [
  {
    path: '',
    component: InfoFurgonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoFurgonPageRoutingModule {}
