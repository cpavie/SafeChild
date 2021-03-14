import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsLoggedGuard } from "../../guards/is-logged.guard";
import { RastreoApoderadoGuard } from "../../guards/rastreo-apoderado.guard";
import { TabsApoderadoPage } from './tabs-apoderado.page';

const routes: Routes = [
  {
    path: '',
    component: TabsApoderadoPage,
    children: [
      {
        path: 'rastreo-apoderado/:id',
        canActivate:[IsLoggedGuard,RastreoApoderadoGuard],
        loadChildren: () => import('../rastreo-apoderado/rastreo-apoderado.module').then( m => m.RastreoApoderadoPageModule)
      },
      {
        path: 'rastreo-apoderado',
        canActivate:[IsLoggedGuard,RastreoApoderadoGuard],
        loadChildren: () => import('../rastreo-apoderado/rastreo-apoderado.module').then( m => m.RastreoApoderadoPageModule)
      },
      {
        path: 'perfil-apoderado',
        canActivate:[IsLoggedGuard],
        loadChildren: () => import('../perfil-apoderado/perfil-apoderado.module').then( m => m.PerfilApoderadoPageModule)
      },
      {
        path: 'inicio-apoderado',
        canActivate:[IsLoggedGuard],
        loadChildren: () => import('../inicio-apoderado/inicio-apoderado.module').then( m => m.InicioApoderadoPageModule)
      },  
      {
        path: 'info-furgon',
        canActivate:[IsLoggedGuard,RastreoApoderadoGuard],
        loadChildren: () => import('../info-furgon/info-furgon.module').then( m => m.InfoFurgonPageModule)
      },
      {
        path: 'info-conductor',
        canActivate:[IsLoggedGuard,RastreoApoderadoGuard],
        loadChildren: () => import('../info-conductor/info-conductor.module').then( m => m.InfoConductorPageModule)
      },
      {
        path: 'info-auxiliar',
        canActivate:[IsLoggedGuard,RastreoApoderadoGuard],
        loadChildren: () => import('../info-auxiliar/info-auxiliar.module').then( m => m.InfoAuxiliarPageModule)
      },
      {
        path: '',
        redirectTo: 'inicio-apoderado',
        pathMatch: 'full'
      }
    ]
    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsApoderadoPageRoutingModule {}
