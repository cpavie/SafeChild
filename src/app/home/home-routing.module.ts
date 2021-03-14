import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { IsLoggedGuard } from "../guards/is-logged.guard";

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'tabs-conductor',
        canActivate:[IsLoggedGuard],
        loadChildren: () => import('../conductor/tabs-conductor/tabs-conductor.module').then( m => m.TabsConductorPageModule)
      },
      {
        path: 'tabs-apoderado',
        canActivate:[IsLoggedGuard],
        loadChildren: () => import('../apoderado/tabs-apoderado/tabs-apoderado.module').then( m => m.TabsApoderadoPageModule)
      }
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
