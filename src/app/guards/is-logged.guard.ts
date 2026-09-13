import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { take, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class IsLoggedGuard  {
  constructor(private auth: AngularFireAuth, private router: Router) {}
  canActivate() {
    return this.auth.authState.pipe(
      take(1),
      switchMap(async (authState) => {
        if (authState) {
          // check are user is logged in
          return true;
        } else {
          this.router.navigate(["/home"]);
          return false;
        }
      })
    );
  }
}
