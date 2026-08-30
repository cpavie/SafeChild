import { Component, OnInit, OnDestroy } from "@angular/core";
import * as Leaflet from "leaflet";
import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import { DatosConductorService } from "src/app/servicios/datos-conductor.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import {
  AlertController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import { AngularFireAuth } from "@angular/fire/auth";
import { Subscription } from "rxjs";
import { auditTime, filter } from "rxjs/operators";
import { AyudaPage } from "src/app/ayuda/ayuda.page";

@Component({
  selector: "app-rastreo-conductor",
  templateUrl: "./rastreo-conductor.page.html",
  styleUrls: ["./rastreo-conductor.page.scss"],
})
export class RastreoConductorPage implements OnInit, OnDestroy {
  uid: string;
  map: Leaflet.Map;
  lat: number;
  lon: number;
  bind: Array<any> = [];
  ids_alumnos: Array<any> = [];
  nombres_alumnos: Array<any> = [];
  sub: Subscription;
  layerGroup: any;
  private popstateHandler = () => {
    // alert() bloqueaba el hilo de JS (y con el, cualquier herramienta
    // que dependa de ejecutar script en la pagina) hasta que el
    // usuario lo cerraba. El toast informa sin bloquear.
    this.toastController
      .create({
        message: "Para salir, primero finalice la ruta",
        duration: 2500,
        color: "warning",
      })
      .then((toast) => toast.present());
    history.pushState(null, null, window.location.pathname);
  };

  constructor(
    private geolocation: Geolocation,
    public dataService: DatosConductorService,
    public db: AngularFirestore,
    public router: Router,
    public toastController: ToastController,
    public AFA: AngularFireAuth,
    public alertController: AlertController,
    private modalController: ModalController
  ) {
    window.addEventListener("popstate", this.popstateHandler, false);
  }

  ngOnInit() {
    // El id del documento conductor/{uid} ES el uid de Firebase Auth
    // (ver firestore.rules), no un campo id_conductor dentro del doc
    // (ese campo no existe). Se guarda aparte para los updates propios
    // de con_estado en toast()/logout().
    this.AFA.currentUser.then((user) => {
      if (user) {
        this.uid = user.uid;
      }
    });
    this.geolocation.getCurrentPosition().then(
      (resp) => {
        this.lat = resp.coords.latitude;
        this.lon = resp.coords.longitude;
        this.db
          .collection("furgon")
          .doc(this.dataService.getDataConductor().id_furgon)
          .update({
            fur_coordenadas: [this.lat, this.lon],
          })
          .catch(() => this.avisarErrorTracking());
        this.leafletMap();
        this.nombres_alumnos = this.dataService.getNombresAlumnos();
        this.ids_alumnos = this.dataService.getIdsAlumnos();

        // watchPosition emite cuando el GPS reporta una posicion nueva
        // (evento), no cada X segundos aunque el furgon este detenido.
        // auditTime acota las escrituras a Firestore a como maximo una
        // cada 5s aunque el GPS emita mas seguido.
        this.sub = this.geolocation
          .watchPosition({ enableHighAccuracy: true })
          .pipe(
            filter((pos): pos is Geoposition => !!(pos as Geoposition).coords),
            auditTime(5000)
          )
          .subscribe((pos: Geoposition) => {
            this.lat = pos.coords.latitude;
            this.lon = pos.coords.longitude;
            this.db
              .collection("furgon")
              .doc(this.dataService.getDataConductor().id_furgon)
              .update({
                fur_coordenadas: [this.lat, this.lon],
              })
              .catch(() => this.avisarErrorTracking());
            this.map.flyTo([this.lat, this.lon], 17);

            var myIcon = Leaflet.icon({
              iconUrl: "../../assets/icon/iconmap.png",
              iconSize: [38, 95],
              iconAnchor: [22, 94],
            });
            if (this.layerGroup != undefined) {
              this.layerGroup.clearLayers();
            }

            this.layerGroup = Leaflet.layerGroup().addTo(this.map);

            Leaflet.marker([this.lat, this.lon], { icon: myIcon }).addTo(
              this.layerGroup
            );
          });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  private mostrandoErrorTracking = false;

  // Si falla la escritura de fur_coordenadas (p.ej. sin conexion), el
  // conductor no tenia forma de saber que dejo de transmitir su
  // ubicacion mientras los apoderados ven el furgon "congelado". El
  // flag evita apilar un toast por cada intento fallido cada 5s.
  private async avisarErrorTracking() {
    if (this.mostrandoErrorTracking) {
      return;
    }
    this.mostrandoErrorTracking = true;
    const toast = await this.toastController.create({
      header: "Sin conexión: no se está transmitiendo la ubicación",
      duration: 4000,
      position: "top",
      color: "danger",
    });
    toast.onWillDismiss().then(() => (this.mostrandoErrorTracking = false));
    toast.present();
  }

  leafletMap() {
    this.map = Leaflet.map("map1").setView([this.lat, this.lon], 17);
    Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    }).addTo(this.map);

    var myIcon = Leaflet.icon({
      iconUrl: "../../assets/icon/iconmap.png",
      iconSize: [38, 95],
      iconAnchor: [22, 94],
    });
    this.layerGroup = Leaflet.layerGroup().addTo(this.map);
    Leaflet.marker([this.lat, this.lon], { icon: myIcon }).addTo(
      this.layerGroup
    );
  }

  async finalizarRutaAlum(bind) {
    const alert = await this.alertController.create({
      header: "¿Llego a su destino el alumno seleccionado?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          handler: (a) => {},
        },
        {
          text: "Confirmar",
          handler: (b) => {
            this.db.collection("alumno").doc(bind).update({
              alu_estado: 0,
            });
            // nombres_alumnos se recorta junto con ids_alumnos, en el
            // mismo indice: estan pareados por posicion (ver el
            // *ngFor en el template), asi que recortar solo uno
            // desalinea los nombres mostrados con el resto de
            // alumnos.
            const index = this.ids_alumnos.indexOf(bind);
            if (index > -1) {
              this.ids_alumnos = [
                ...this.ids_alumnos.slice(0, index),
                ...this.ids_alumnos.slice(index + 1),
              ];
              this.nombres_alumnos = [
                ...this.nombres_alumnos.slice(0, index),
                ...this.nombres_alumnos.slice(index + 1),
              ];
            }
            if (!this.ids_alumnos?.length) {
              this.dataService.ids_alumnos.length = 0;
              this.dataService.nombres_alumnos.length = 0;
              this.toast();
            } else {
              this.reload("tabs-conductor/rastreo-conductor");
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl(url, { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  async toast() {
    const toast = await this.toastController.create({
      header: "Ha finalizado la ruta con exito, felicitaciones!",
      duration: 4000,
      position: "middle",
    });
    toast.present();

    // batch en vez de dos update() independientes: si la app se
    // cierra a mitad de camino, o ambos cambios quedan aplicados o
    // ninguno, nunca un estado a medias (conductor libre pero
    // auxiliar todavia "en ruta").
    const batch = this.db.firestore.batch();
    batch.update(
      this.db
        .collection("auxiliar")
        .doc(this.dataService.getIdAuxiliar()).ref,
      { aux_estado: 0 }
    );
    batch.update(
      this.db.collection("conductor").doc(this.uid).ref,
      { con_estado: 0 }
    );
    await batch.commit().catch(() => this.avisarErrorTracking());

    this.sub.unsubscribe();
    this.AFA.signOut();
    toast.onWillDismiss().then((a) => window.location.replace("/home"));
  }

  async logout() {
    const alert = await this.alertController.create({
      header: "Al presionar confirmar se finalizara la ruta.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          handler: (a) => {},
        },
        {
          text: "Confirmar",
          handler: async (b) => {
            // batch: conductor/auxiliar/alumnos deben quedar todos
            // liberados juntos, no en updates independientes que
            // pueden quedar a medias si la app se cierra.
            const batch = this.db.firestore.batch();
            batch.update(
              this.db
                .collection("auxiliar")
                .doc(this.dataService.getIdAuxiliar()).ref,
              { aux_estado: 0 }
            );
            batch.update(
              this.db.collection("conductor").doc(this.uid).ref,
              { con_estado: 0 }
            );
            for (let i = 0; i < this.ids_alumnos.length; i++) {
              batch.update(
                this.db.collection("alumno").doc(this.ids_alumnos[i]).ref,
                { alu_estado: 0 }
              );
            }
            await batch.commit().catch(() => this.avisarErrorTracking());
            this.AFA.signOut();
            this.router.navigate(["/home"]);
          },
        },
      ],
    });
    await alert.present();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    window.removeEventListener("popstate", this.popstateHandler, false);
    if (this.map) {
      this.map.remove();
    }
  }

  async ayuda() {
    const modal = await this.modalController.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
