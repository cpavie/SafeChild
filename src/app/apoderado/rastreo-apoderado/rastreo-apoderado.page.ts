import { Component, OnDestroy, OnInit } from "@angular/core";
import * as Leaflet from "leaflet";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { DatosService } from "../../servicios/datos.service";
import {
  AlertController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import { InfoConductorPage } from "../info-conductor/info-conductor.page";
import { InfoFurgonPage } from "../info-furgon/info-furgon.page";
import { InfoAuxiliarPage } from "../info-auxiliar/info-auxiliar.page";
import { Subscription } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import { AyudaPage } from "src/app/ayuda/ayuda.page";

@Component({
  selector: "app-rastreo-apoderado",
  templateUrl: "./rastreo-apoderado.page.html",
  styleUrls: ["./rastreo-apoderado.page.scss"],
})
export class RastreoApoderadoPage implements OnInit, OnDestroy {
  map: Leaflet.Map;
  lat: number;
  lon: number;
  coords: {};
  id_aux: Array<any> = [];
  sub: Subscription;
  subAlumno: Subscription;
  layerGroup: any;
  private infoCargada = false;

  constructor(
    public geolocation: Geolocation,
    public router: Router,
    public db: AngularFirestore,
    public route: ActivatedRoute,
    public dataService: DatosService,
    public modalCtrl: ModalController,
    public AFA: AngularFireAuth,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    var container = document.getElementById("map1");
    if (container != null) {
      container.outerHTML = "";
    }
  }

  ngOnInit() {
    if (!this.map) {
      this.db
        .collection("furgon")
        .doc(this.dataService.getDataAlumno().id_furgon)
        .get()
        .forEach((doc) => {
          this.coords = doc.get("fur_coordenadas");
          this.lat = this.coords[0];
          this.lon = this.coords[1];
          this.leafletMap();
        })
        .catch(() => this.avisarErrorCarga());
    }
  }

  ionViewDidEnter() {
    // Escucha en tiempo real la posicion del furgon: Firestore empuja el
    // cambio apenas el conductor actualiza fur_coordenadas, sin esperar
    // un ciclo de polling.
    this.sub = this.db
      .collection("furgon")
      .doc(this.dataService.getDataAlumno().id_furgon)
      .valueChanges()
      .subscribe((data: any) => {
        if (!data) {
          return;
        }
        this.coords = Object.values(data.fur_coordenadas);
        this.lat = this.coords[0];
        this.lon = this.coords[1];

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
        this.map.flyTo([this.lat, this.lon], 17);

        // Datos de conductor/auxiliar casi no cambian durante la ruta:
        // se piden una sola vez, no en cada actualizacion de posicion.
        if (!this.infoCargada) {
          this.infoCargada = true;
          this.id_aux = Object.values(data.auxiliares);
          this.db
            .collection("conductor")
            .doc(data.id_conductor)
            .get()
            .forEach((doc) => {
              this.dataService.setDataConductor(doc.data());
              this.db
                .collection("persona")
                .doc(this.dataService.getDataConductor().id_persona)
                .get()
                .forEach((doc) => {
                  this.dataService.setDataConductorPersona(doc.data());
                })
                .catch(() => this.avisarErrorCarga());
            })
            .catch(() => this.avisarErrorCarga());
          for (let i = 0; i < this.id_aux.length; i++) {
            this.db
              .collection("auxiliar")
              .doc(this.id_aux[i])
              .get()
              .forEach((doc) => {
                if (doc.get("aux_estado") == "1") {
                  this.dataService.setDataAuxiliar(doc.data());
                  this.db
                    .collection("persona")
                    .doc(this.dataService.getDataAuxiliar().id_persona)
                    .get()
                    .forEach((doc) => {
                      this.dataService.setDataAuxiliarPersona(doc.data());
                    })
                    .catch(() => this.avisarErrorCarga());
                }
              })
              .catch(() => this.avisarErrorCarga());
          }
        }
        if (!this.map) {
          this.leafletMap();
        }
        this.map.invalidateSize();
      });

    // Escucha en tiempo real el estado del alumno para avisar apenas el
    // conductor marca que llego a destino.
    this.subAlumno = this.db
      .collection("alumno")
      .doc(this.dataService.getDataAlumno().id_alumno)
      .valueChanges()
      .subscribe((data: any) => {
        if (data && data.alu_estado == 0) {
          let a: string = "";
          this.dataService.setDataAlumno(a);
          this.toastA();
        }
      });
  }

  private avisandoErrorCarga = false;

  // Las cadenas de lecturas anidadas (conductor -> persona,
  // auxiliar -> persona) no tenian manejo de error: si algo fallaba
  // (permiso denegado, doc borrado), la UI quedaba a medio cargar sin
  // avisar. El flag evita apilar un toast por cada lectura que falle.
  private async avisarErrorCarga() {
    if (this.avisandoErrorCarga) {
      return;
    }
    this.avisandoErrorCarga = true;
    const toast = await this.toastController.create({
      header: "No se pudo cargar parte de la información. Intente de nuevo.",
      duration: 4000,
      color: "danger",
    });
    toast.onWillDismiss().then(() => (this.avisandoErrorCarga = false));
    toast.present();
  }

  async toastA() {
    const toast = await this.toastController.create({
      header: "Su alumno llego a su destino",
      duration: 4000,
      position: "middle",
    });
    toast.present();

    toast.onWillDismiss().then((a) => window.location.replace("/home"));
  }

  ionViewDidLeave() {
    this.ngOnDestroy();
  }

  leafletMap() {
    this.map = Leaflet.map("map1").setView([this.lat, this.lon], 17);
    Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    }).addTo(this.map);

    var myIcon = Leaflet.icon({
      iconUrl: "../../assets/icon/iconmap.png",
      iconSize: [55, 55],
      iconAnchor: [22, 94],
    });

    this.layerGroup = Leaflet.layerGroup().addTo(this.map);
    Leaflet.marker([this.lat, this.lon], { icon: myIcon }).addTo(
      this.layerGroup
    );
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.subAlumno) {
      this.subAlumno.unsubscribe();
    }
    var container = document.getElementById("map1");
    if (container != null) {
      container.outerHTML = "";
    }
  }

  async goInfoConductor() {
    const modal = await this.modalCtrl.create({
      component: InfoConductorPage,
      componentProps: {
        dataConductor: this.dataService.getDataConductor(),
        dataConductorPersona: this.dataService.getDataConductorPersona(),
      },
    });
    await modal.present();
  }

  async goInfoAuxiliar() {
    const modal = await this.modalCtrl.create({
      component: InfoAuxiliarPage,
      componentProps: {
        dataAux: this.dataService.getDataAuxiliar(),
        dataAuxPersona: this.dataService.getDataAuxiliarPersona(),
      },
    });
    await modal.present();
  }
  async goInfoFurgon() {
    const modal = await this.modalCtrl.create({
      component: InfoFurgonPage,
      componentProps: {
        dataFurgon: this.dataService.getdataFurgon(),
      },
    });
    await modal.present();
  }
  async logout() {
    const alert = await this.alertController.create({
      header: "¿Desea cerrar sesión?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          handler: (a) => {},
        },
        {
          text: "Confirmar",
          handler: (b) => {
            this.AFA.signOut();
            this.router.navigate(["/home"]);
          },
        },
      ],
    });
    await alert.present();
  }

  async ayuda() {
    const modal = await this.modalCtrl.create({
      component: AyudaPage,
    });
    await modal.present();
  }
}
