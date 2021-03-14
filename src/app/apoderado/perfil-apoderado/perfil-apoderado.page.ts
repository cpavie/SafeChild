import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { DatosService } from "../../servicios/datos.service";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { AyudaPage } from 'src/app/ayuda/ayuda.page';
import { ResetpasswordPage } from 'src/app/resetpassword/resetpassword.page';

@Component({
  selector: 'app-perfil-apoderado',
  templateUrl: './perfil-apoderado.page.html',
  styleUrls: ['./perfil-apoderado.page.scss'],
})

export class PerfilApoderadoPage implements OnInit {

  constructor(public AFA : AngularFireAuth,
     public router: Router,
     public db: AngularFirestore,
     public dataService: DatosService,
     public alertController: AlertController,
     public toastController: ToastController,
     private modalController: ModalController) { }

     telefono:number;
     comuna:string;
     direccion:string;


  ngOnInit() {
  }

  ionViewWillEnter(){
    this.telefono = this.dataService.getDataApoderado().apo_telefono
    this.comuna = this.dataService.getDataApoderadoPersona().p_comuna
    this.direccion = this.dataService.getDataApoderadoPersona().p_direccion
  }

  async save(){
    const alert = await this.alertController.create({
      header: '¿Desea guardar los cambios?',
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
            this.db.collection('apoderado').doc(this.dataService.getDataApoderado().id_apoderado).update({
              apo_telefono: this.telefono
            }).catch(err=>console.log(err))
            this.db.collection('persona').doc(this.dataService.getDataApoderado().id_persona).update({
              p_direccion: this.direccion,
              p_comuna: this.comuna
            }).catch(err=>console.log(err))
            this.toast();
          }
        }
      ]
    })
    await alert.present();
  }
  async toast(){
        const toast = await this.toastController.create({
          header:'Datos guardados',
          duration: 2000
        });
        toast.present()
  }

  async goResetPassword(){
    const modal = await this.modalController.create({
          component: ResetpasswordPage
        })
        await modal.present();
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
            this.AFA.signOut();
            this.router.navigate(['/home'])
          }
        }
      ]
    })
    await alert.present();
  }
  async ayuda(){
    const modal = await this.modalController.create({
                component: AyudaPage
      })
    await modal.present()
  }
}
