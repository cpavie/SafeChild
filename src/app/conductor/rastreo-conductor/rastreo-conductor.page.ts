import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Leaflet from 'leaflet';
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { DatosConductorService } from 'src/app/servicios/datos-conductor.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription, interval } from 'rxjs';
import { AyudaPage } from 'src/app/ayuda/ayuda.page';

@Component({
  selector: 'app-rastreo-conductor',
  templateUrl: './rastreo-conductor.page.html',
  styleUrls: ['./rastreo-conductor.page.scss'],
})
export class RastreoConductorPage implements OnInit,OnDestroy{
  map:Leaflet.Map;
  lat:number;
  lon:number;
  bind:Array < any > = [];;
  ids_alumnos: Array < any > = [];
  nombres_alumnos: Array < any > = [];
  sub: Subscription
  layerGroup:any

  constructor(private geolocation: Geolocation,
     public dataService: DatosConductorService,
     public db: AngularFirestore,
     public router: Router,
     public toastController: ToastController,
     public AFA: AngularFireAuth,
     public alertController: AlertController,
     private modalController: ModalController) { }

  ngOnInit() {
    this.geolocation.getCurrentPosition().then((resp)=>{
      this.lat = resp.coords.latitude;
      this.lon = resp.coords.longitude;
      this.db.collection('furgon').doc(this.dataService.getDataConductor().id_furgon).update({
        fur_coordenadas: [this.lat,this.lon]                  
      })
      this.leafletMap();
      this.nombres_alumnos = this.dataService.getNombresAlumnos();
          this.ids_alumnos = this.dataService.getIdsAlumnos();
          this.sub = interval(6000).subscribe((func =>{
            this.geolocation.getCurrentPosition().then((resp)=>{
                this.lat = resp.coords.latitude;
                this.lon = resp.coords.longitude;                
                this.db.collection('furgon').doc(this.dataService.getDataConductor().id_furgon).update({
                  fur_coordenadas: [this.lat,this.lon]                  
                })
                this.map.flyTo([this.lat,this.lon],17)
            
                 var myIcon = Leaflet.icon({
                  iconUrl: '../../assets/icon/iconmap.png',
                  iconSize: [38, 95],
                  iconAnchor: [22, 94]
                  });
                  if(this.layerGroup != undefined){
                    this.layerGroup.clearLayers()
                  }

                    this.layerGroup = Leaflet.layerGroup().addTo(this.map)

                    Leaflet.marker([this.lat,this.lon], {icon: myIcon}).addTo(this.layerGroup)


              })
          }))
    },(err) =>{
      console.log(err);
    })
  }

  leafletMap() {
    this.map = Leaflet.map('map1').setView([this.lat,this.lon], 17);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    }).addTo(this.map);

    var myIcon = Leaflet.icon({
      iconUrl: '../../assets/icon/iconmap.png',
      iconSize: [38, 95],
      iconAnchor: [22, 94]
      });
    this.layerGroup = Leaflet.layerGroup().addTo(this.map)
    Leaflet.marker([this.lat, this.lon], {icon: myIcon}).addTo(this.layerGroup);
  }

  async finalizarRutaAlum(bind){
    const alert = await this.alertController.create({
      header: '¿Llego a su destino el alumno seleccionado?' ,
      buttons:[
        {
          text: 'Cancelar',
          role:'cancel',
          handler: a =>{
          }
        },
        {
          text: 'Confirmar',
          handler: b =>{
            this.db.collection('alumno').doc(bind).update({
              alu_estado : 0
            })
            const index = this.ids_alumnos.indexOf(bind)
            this.ids_alumnos = (index > -1) ? [
            ...this.ids_alumnos.slice(0, index),
            ...this.ids_alumnos.slice(index + 1)
            ] : this.ids_alumnos;
            if(!this.ids_alumnos?.length){   
                this.dataService.ids_alumnos.length = 0
                this.dataService.nombres_alumnos.length = 0
                this.toast()

            }else{
                this.reload('tabs-conductor/rastreo-conductor');
            }
          }
        }
      ]
    })
    await alert.present();
  }
  

  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl(url, { skipLocationChange: true });
    return this.router.navigateByUrl(url);    
  }



  async toast(){
        const toast = await this.toastController.create({
          header:'Ha finalizado la ruta con exito, felicitaciones!',
          duration: 4000,
          position:'middle'
        });
        toast.present()

        this.db.collection('auxiliar').doc(this.dataService.getDataAuxiliar().id_auxiliar).update({
          aux_estado : 0
        })
        this.db.collection('conductor').doc(this.dataService.getDataConductor().id_conductor).update({
          con_estado : 0
        })
        this.sub.unsubscribe()
        toast.onWillDismiss().then(a=>window.location.replace('/home'))
        
  }
  
  async logout() {
      const alert = await this.alertController.create({
      header: '¿Desea cerrar sesión?' ,
      buttons:[
        {
          text: 'Cancelar',
          role:'cancel',
          handler: a =>{
          }
        },
        {
          text: 'Confirmar',
          handler: b =>{
            this.db.collection('conductor').doc(this.dataService.getDataConductor().id_conductor).get().forEach(doc=>{
              if (doc.get('con_estado')==0) {
                this.AFA.signOut();
                this.router.navigate(['/home'])
              }
            })            
          }
        }
      ]
    })
    await alert.present();
  }

  ngOnDestroy() {
    this.map.remove();  
  }

  async ayuda(){
    const modal = await this.modalController.create({
                component: AyudaPage
      })
    await modal.present()
  }
}
