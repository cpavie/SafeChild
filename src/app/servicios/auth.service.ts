import {
  Injectable
} from '@angular/core';
import {
  AngularFireAuth
} from "@angular/fire/auth";
import {
  AngularFirestore
} from "@angular/fire/firestore";
import {
  Router
} from "@angular/router";
import {
  AlertController
} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AFauth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    public alertcontroller: AlertController) {
  }

  async login(email: string, password: string, type: string) {
    if (type !== 'apoderado' && type !== 'conductor') {
      alert('usuario, contraseña y/o tipo de usuario incorrecto');
      return null;
    }
    try {
      const res = await this.AFauth.signInWithEmailAndPassword(email, password);
      const roleDoc = await this.db.collection(type).doc(res.user.uid).get().toPromise();
      if (!roleDoc.exists) {
        // El usuario se autenticó pero no tiene un documento del rol seleccionado:
        // cerramos la sesión para no dejarlo autenticado con un rol incorrecto.
        await this.AFauth.signOut();
        alert('usuario, contraseña y/o tipo de usuario incorrecto');
        return null;
      }
      this.router.navigate([type === 'conductor' ? '/tabs-conductor' : '/tabs-apoderado']);
      return res.user.uid;
    } catch (err) {
      alert('usuario, contraseña y/o tipo de usuario incorrecto');
      return null;
    }
  }
}