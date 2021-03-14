import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsLoggedGuard } from "../../guards/is-logged.guard";
import { RastreoConductorGuard } from "../../guards/rastreo-conductor.guard";
import { InicioConductorGuard } from "../../guards/inicio-conductor.guard";
import { TabsConductorPage } from './tabs-conductor.page';

const routes: Routes = [
  {
    path: '',
    component: TabsConductorPage,
    children: [
      {
        path: 'rastreo-conductor',
        canActivate:[IsLoggedGuard,RastreoConductorGuard],
        loadChildren: () => import('../rastreo-conductor/rastreo-conductor.module').then( m => m.RastreoConductorPageModule)
      },
      {
        path: 'perfil-conductor',
        canActivate:[IsLoggedGuard],
        loadChildren: () => import('../perfil-conductor/perfil-conductor.module').then( m => m.PerfilConductorPageModule)
      },
      {
        path: 'inicio-conductor',
        canActivate:[IsLoggedGuard,InicioConductorGuard],
        loadChildren: () => import('../inicio-conductor/inicio-conductor.module').then( m => m.InicioConductorPageModule)
      },
      {
        path: '',
        redirectTo: 'inicio-conductor',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsConductorPageRoutingModule {}
