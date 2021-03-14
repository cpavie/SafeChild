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

  login(email: string, password: string, type: string) {
    return new Promise((resolve, rejected) => {
      this.AFauth.signInWithEmailAndPassword(email, password).then(res => {
        if (type == "conductor") {
          const b = this.db.collection('conductor').doc(res.user.uid).get().forEach(doc => {
            if (doc.exists) {
              this.router.navigate(['/tabs-conductor'])
            } else {
              alert('usuario, contraseña y/o tipo de usuario incorrecto')
            }
          }).catch(err => console.log(err))
        }
        if (type == "apoderado") {
          const a = this.db.collection('apoderado').doc(res.user.uid).get().forEach(doc => {
            if (doc.exists) {
              this.router.navigate(['/tabs-apoderado'])
            } else {
              alert('usuario, contraseña y/o tipo de usuario incorrecto')
            }
          }).catch(err => console.log(err));
        }
        resolve(res.user.uid)
      }).catch(err => alert('usuario, contraseña y/o tipo de usuario incorrecto'))
    })
  }
}