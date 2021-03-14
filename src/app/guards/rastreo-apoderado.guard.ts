import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DatosService } from '../servicios/datos.service';

@Injectable({
  providedIn: 'root'
})
export class RastreoApoderadoGuard implements CanActivate {
  constructor(private dataService : DatosService,private toastController:ToastController){}
  async toast(){
        const toast = await this.toastController.create({
          header:'Seleccione un alumno para rastrear',
          duration:1700,
          position: 'bottom'
        });
        toast.present()
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
    if (this.dataService.getDataAlumno().id_alumno) {
        return true;
    }
      this.toast()
      return false    
  }
  
}
