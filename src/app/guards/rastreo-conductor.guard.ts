import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DatosConductorService } from '../servicios/datos-conductor.service';


@Injectable({
  providedIn: 'root'
})
export class RastreoConductorGuard implements CanActivate {

  constructor(private toastController: ToastController,
              private dataService: DatosConductorService){}

  async toast(){
        const toast = await this.toastController.create({
          header:'Comienza una ruta',
          duration:1700,
          position: 'bottom'
        });
        toast.present()
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.dataService.nombres_alumnos.toString().length != 0 || this.dataService.ids_alumnos.toString().length != 0) {
          return true;
    }
    this.toast()
    return false
  }
  
}
