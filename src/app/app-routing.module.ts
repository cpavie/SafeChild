import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IsLoggedGuard } from './guards/is-logged.guard';
import { RoleGuard } from './guards/role.guard';

// tabs-conductor y tabs-apoderado van a nivel raiz (no como hijas de
// 'home') porque HomePage (login) no tiene <ion-router-outlet> propio;
// el <ion-router-outlet> que existe es el de app.component.html, asi que
// las paginas que reemplazan a HomePage tras el login deben ser rutas
// hermanas de 'home', no hijas. El control de acceso (sesion + rol) se
// aplica aqui mismo con los guards.
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
    path: 'tabs-conductor',
    canActivate: [IsLoggedGuard, RoleGuard],
    data: { role: 'conductor' },
    loadChildren: () => import('./conductor/tabs-conductor/tabs-conductor.module').then( m => m.TabsConductorPageModule)
  },
  {
    path: 'tabs-apoderado',
    canActivate: [IsLoggedGuard, RoleGuard],
    data: { role: 'apoderado' },
    loadChildren: () => import('./apoderado/tabs-apoderado/tabs-apoderado.module').then( m => m.TabsApoderadoPageModule)
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
