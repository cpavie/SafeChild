import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class IsLoggedGuard implements CanActivate {
  constructor(private AFA:AngularFireAuth,
    private router: Router){

  }
  state:number
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.AFA.authState.subscribe(res=>{
      if (res && res.uid) {
        this.state = 1
      }else{
        this.state = 0
      }
    })

    if (this.state == 1) {
      return true
    }else{
      this.router.navigate(['/home'])
      return false
    }
  }
  
}
