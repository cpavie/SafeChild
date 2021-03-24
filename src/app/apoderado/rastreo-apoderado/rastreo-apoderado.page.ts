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
import { Subscription, interval } from "rxjs";
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
  layerGroup: any;

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
        });
    }
  }

  ionViewDidEnter() {
    this.sub = interval(6000).subscribe((func) => {
      this.db
        .collection("furgon")
        .doc(this.dataService.getDataAlumno().id_furgon)
        .get()
        .forEach((doc) => {
          this.coords = Object.values(doc.get("fur_coordenadas"));
          this.lat = this.coords[0];
          this.lon = this.coords[1];
        });
      this.db
        .collection("alumno")
        .doc(this.dataService.getDataAlumno().id_alumno)
        .get()
        .forEach((doc) => {
          if (doc.get("alu_estado") == 0) {
            let a: string = "";
            this.dataService.setDataAlumno(a);
            this.toastA();
          }
        });

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
    });

    this.db
      .collection("furgon")
      .doc(this.dataService.getDataAlumno().id_furgon)
      .get()
      .forEach((doc) => {
        this.id_aux = Object.values(doc.get("auxiliares"));
        this.db
          .collection("conductor")
          .doc(this.dataService.getdataFurgon().id_conductor)
          .get()
          .forEach((doc) => {
            this.dataService.setDataConductor(doc.data());
            this.db
              .collection("persona")
              .doc(this.dataService.getDataConductor().id_persona)
              .get()
              .forEach((doc) => {
                this.dataService.setDataConductorPersona(doc.data());
              });
          });
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
                  });
              }
            });
        }
        if (!this.map) {
          this.leafletMap();
        }
        this.map.invalidateSize();
      });
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
    var container = document.getElementById("map1");
    if (container == undefined) {
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
