import { Component, OnInit, OnDestroy } from "@angular/core";
import * as Leaflet from "leaflet";
import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import { DatosService } from "src/app/servicios/datos.service";
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
    public dataService: DatosService,
    public db: AngularFirestore,
    public router: Router,
    public toastController: ToastController,
    public AFA: AngularFireAuth,
    public alertController: AlertController,
    private modalController: ModalController
  ) {}

  /*
   * El seguimiento arranca en ionViewWillEnter, no en ngOnInit, porque
   * esta pagina es una tab: Ionic mantiene vivo su componente al salir,
   * asi que ngOnInit corre una sola vez en toda la sesion. Al terminar
   * una ruta y comenzar otra, ngOnInit no volveria a ejecutarse y la
   * pantalla quedaria con el mapa y la lista de la ruta anterior.
   *
   * El flag evita re-inicializar al volver de otra tab en mitad de una
   * ruta, que tambien dispara ionViewWillEnter.
   */
  private seguimientoActivo = false;

  ionViewWillEnter() {
    if (!this.seguimientoActivo) {
      this.iniciarSeguimiento();
    }
  }

  ngOnInit() {}

  private iniciarSeguimiento() {
    this.seguimientoActivo = true;
    window.addEventListener("popstate", this.popstateHandler, false);
    // El id del documento conductor/{uid} ES el uid de Firebase Auth
    // (ver firestore.rules), no un campo id_conductor dentro del doc
    // (ese campo no existe). Se guarda aparte para los updates propios
    // de con_estado en liberarRuta().
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
    // Sin los botones +/- de Leaflet: quedan bajo la tarjeta de vidrio
    // que flota sobre el mapa, y en telefono el zoom se hace con pinza.
    this.map = Leaflet.map("map1", { zoomControl: false }).setView(
      [this.lat, this.lon],
      17
    );
    Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      // Las teselas son de openstreetmap.org: la atribucion a Mapbox
      // que habia aqui citaba a un proveedor que no se usa.
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

    // El mapa ya no vive en una tarjeta de alto fijo: ocupa el hueco que
    // deja la hoja inferior. Leaflet mide el contenedor al crearse, asi
    // que si el layout todavia no asento se queda con un alto de 0.
    setTimeout(() => this.map && this.map.invalidateSize(), 0);
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

  // El mapa sigue al furgon, pero el conductor puede haberlo arrastrado
  // para mirar el resto de la ruta: esto lo devuelve a su posicion sin
  // esperar la proxima lectura del GPS.
  recentrar() {
    if (this.map && this.lat != null && this.lon != null) {
      this.map.flyTo([this.lat, this.lon], 17);
    }
  }

  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl(url, { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  // Se llega aca cuando ya se bajo al ultimo alumno: la ruta termina
  // sola, sin que el conductor tenga que pulsar "Finalizar ruta".
  async toast() {
    const toast = await this.toastController.create({
      header: "Ha finalizado la ruta con exito, felicitaciones!",
      duration: 4000,
      position: "middle",
    });
    toast.present();
    // Los alumnos ya quedaron en alu_estado 0 al bajarlos uno por uno.
    await this.liberarRuta([]);
    toast.onWillDismiss().then(() => this.volverAlInicio());
  }

  async finalizarRuta() {
    const alert = await this.alertController.create({
      header: "¿Desea finalizar la ruta?",
      message:
        "Se liberara el furgon y volvera al inicio para comenzar una ruta nueva. No se cerrara su sesion.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          handler: (a) => {},
        },
        {
          text: "Confirmar",
          handler: async (b) => {
            await this.liberarRuta(this.ids_alumnos);
            this.volverAlInicio();
          },
        },
      ],
    });
    await alert.present();
  }

  /*
   * Deja conductor, auxiliar y alumnos libres. batch en vez de updates
   * independientes: si la app se cierra a mitad de camino, o quedan
   * todos aplicados o ninguno, nunca un estado a medias (conductor
   * libre pero auxiliar todavia "en ruta").
   */
  private async liberarRuta(idsAlumnos: string[]) {
    const batch = this.db.firestore.batch();
    batch.update(
      this.db.collection("auxiliar").doc(this.dataService.getIdAuxiliar()).ref,
      { aux_estado: 0 }
    );
    batch.update(this.db.collection("conductor").doc(this.uid).ref, {
      con_estado: 0,
    });
    for (const id of idsAlumnos) {
      batch.update(this.db.collection("alumno").doc(id).ref, {
        alu_estado: 0,
      });
    }
    await batch.commit().catch(() => this.avisarErrorTracking());
  }

  /*
   * Terminar la ruta ya no cierra la sesion: el conductor vuelve al
   * inicio listo para comenzar otra.
   *
   * Se navega con el router, sin recargar la pagina: la sesion de
   * Firebase de esta app NO sobrevive a un reload (authState emite null
   * y IsLoggedGuard rebota a /home), asi que recargar equivaldria a
   * desloguearlo.
   *
   * Como no hay recarga, el estado en memoria hay que soltarlo a mano:
   * el watchPosition y el mapa seguirian vivos, e InicioConductorGuard
   * bloquea el inicio mientras dataService todavia tenga alumnos.
   */
  private volverAlInicio() {
    this.detenerSeguimiento();
    this.dataService.ids_alumnos = [];
    this.dataService.nombres_alumnos = [];
    this.ids_alumnos = [];
    this.nombres_alumnos = [];
    this.router.navigate(["/tabs-conductor/inicio-conductor"]);
  }

  private detenerSeguimiento() {
    this.seguimientoActivo = false;
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    window.removeEventListener("popstate", this.popstateHandler, false);
    if (this.map) {
      // remove() ademas libera el contenedor #map1, que sigue en el DOM
      // porque el componente no se destruye: sin esto, volver a entrar
      // fallaria con "Map container is already initialized".
      this.map.remove();
      this.map = undefined;
    }
    this.layerGroup = undefined;
  }

  ngOnDestroy() {
    this.detenerSeguimiento();
  }

  async ayuda() {
    const modal = await this.modalController.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
