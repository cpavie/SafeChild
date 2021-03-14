import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'inicio-conductor',
    loadChildren: () => import('./conductor/inicio-conductor/inicio-conductor.module').then( m => m.InicioConductorPageModule)
  },
  {
    path: 'rastreo-conductor',
    loadChildren: () => import('./conductor/rastreo-conductor/rastreo-conductor.module').then( m => m.RastreoConductorPageModule)
  },
  {
    path: 'perfil-conductor',
    loadChildren: () => import('./conductor/perfil-conductor/perfil-conductor.module').then( m => m.PerfilConductorPageModule)
  },
  {
    path: 'rastreo-apoderado',
    loadChildren: () => import('./apoderado/rastreo-apoderado/rastreo-apoderado.module').then( m => m.RastreoApoderadoPageModule)
  },
  {
    path: 'perfil-apoderado',
    loadChildren: () => import('./apoderado/perfil-apoderado/perfil-apoderado.module').then( m => m.PerfilApoderadoPageModule)
  },
  {
    path: 'inicio-apoderado',
    loadChildren: () => import('./apoderado/inicio-apoderado/inicio-apoderado.module').then( m => m.InicioApoderadoPageModule)
  },
  {
    path: 'tabs-apoderado',
    loadChildren: () => import('./apoderado/tabs-apoderado/tabs-apoderado.module').then( m => m.TabsApoderadoPageModule)
  },
  {
    path: 'tabs-conductor',
    loadChildren: () => import('./conductor/tabs-conductor/tabs-conductor.module').then( m => m.TabsConductorPageModule)
  },
  {
    path: 'info-furgon',
    loadChildren: () => import('./apoderado/info-furgon/info-furgon.module').then( m => m.InfoFurgonPageModule)
  },
  {
    path: 'info-conductor',
    loadChildren: () => import('./apoderado/info-conductor/info-conductor.module').then( m => m.InfoConductorPageModule)
  },
  {
    path: 'info-auxiliar',
    loadChildren: () => import('./apoderado/info-auxiliar/info-auxiliar.module').then( m => m.InfoAuxiliarPageModule)
  },
  {
    path: 'edit-alumno',
    loadChildren: () => import('./apoderado/edit-alumno/edit-alumno.module').then( m => m.EditAlumnoPageModule)
  },
  {
    path: 'ayuda',
    loadChildren: () => import('./ayuda/ayuda.module').then( m => m.AyudaPageModule)
  },
  {
    path: 'resetpassword',
    loadChildren: () => import('./resetpassword/resetpassword.module').then( m => m.ResetpasswordPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
