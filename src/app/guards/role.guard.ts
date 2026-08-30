import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { take, switchMap } from "rxjs/operators";
import { of } from "rxjs";

// Verifica en Firestore que el usuario autenticado tenga un documento
// en la coleccion del rol requerido por la ruta (route.data.role).
// Sin esto, cualquier usuario autenticado (apoderado o conductor) podia
// navegar directamente a las rutas del otro rol.
@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const requiredRole = route.data && route.data.role;
    return this.auth.authState.pipe(
      take(1),
      switchMap((authState) => {
        if (!authState || !requiredRole) {
          this.router.navigate(["/home"]);
          return of(false);
        }
        return this.db
          .collection(requiredRole)
          .doc(authState.uid)
          .get()
          .pipe(
            take(1),
            switchMap((doc) => {
              if (doc.exists) {
                return of(true);
              }
              this.router.navigate(["/home"]);
              return of(false);
            })
          );
      })
    );
  }
}
