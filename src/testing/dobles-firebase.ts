/*
 * Dobles de prueba para las dependencias externas de la app.
 *
 * Los specs los genero `ionic generate` y nunca se habian ejecutado: 16
 * de 23 fallaban con "No provider for ...", asi que `ng test` no servia
 * de nada. Con esto la suite comprueba al menos que cada pagina se
 * instancia y sobrevive a su ngOnInit, que es justo lo que se rompe al
 * subir de major de Angular.
 *
 * Se doblan solo las dependencias externas (Firestore, Auth, GPS).
 * DatosService y ThemeService son propios, tienen valores por defecto
 * seguros y se usan de verdad: doblarlos ocultaria regresiones.
 */

import { Provider } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { of } from "rxjs";

/** Documento vacio pero con la forma que espera el codigo. */
function snapshotVacio(id: string) {
  return {
    id,
    exists: false,
    data: () => ({}),
    get: (_campo: string) => undefined,
  };
}

/*
 * Imita lo justo de la API de AngularFirestore que la app usa:
 * collection().doc().get()/update()/valueChanges()/ref y el batch.
 *
 * get() devuelve un objeto con toPromise() y forEach() porque conviven
 * los dos estilos: las pantallas principales ya estan en async/await
 * con toPromise(), pero guards y perfiles siguen con forEach().
 */
export class AngularFirestoreDoble {
  collection(_nombre: string) {
    return {
      doc: (id: string) => ({
        ref: {},
        get: () => {
          const promesa = Promise.resolve(snapshotVacio(id));
          return {
            toPromise: () => promesa,
            forEach: (cb: (d: any) => void) => promesa.then(cb),
            subscribe: (cb: (d: any) => void) => {
              promesa.then(cb);
              return { unsubscribe: () => {} };
            },
          };
        },
        update: (_datos: any) => Promise.resolve(),
        set: (_datos: any) => Promise.resolve(),
        // null y no {}: los componentes hacen `if (!data) return;`, que
        // es el camino que interesa ejercitar en una prueba de humo.
        valueChanges: () => of(null),
      }),
    };
  }

  get firestore() {
    return {
      batch: () => ({
        update: (_ref: any, _datos: any) => {},
        commit: () => Promise.resolve(),
      }),
    };
  }
}

export class AngularFireAuthDoble {
  // of(null) a proposito: es lo que authState emite tras cerrar sesion,
  // y asi la suite cubre ese caso (un `res.uid` sin guarda revienta).
  authState = of(null);
  currentUser = Promise.resolve(null);
  signOut() {
    return Promise.resolve();
  }
  signInWithEmailAndPassword() {
    return Promise.resolve({} as any);
  }
  sendPasswordResetEmail() {
    return Promise.resolve();
  }
}

export class GeolocationDoble {
  private posicion = {
    coords: { latitude: -33.45, longitude: -70.66, accuracy: 10 },
    timestamp: 0,
  };
  getCurrentPosition() {
    return Promise.resolve(this.posicion);
  }
  watchPosition() {
    return of(this.posicion);
  }
}

/** Se pasa tal cual al `providers` del TestBed. */
export const proveedoresDePrueba: Provider[] = [
  { provide: AngularFirestore, useClass: AngularFirestoreDoble },
  { provide: AngularFireAuth, useClass: AngularFireAuthDoble },
  { provide: Geolocation, useClass: GeolocationDoble },
];
