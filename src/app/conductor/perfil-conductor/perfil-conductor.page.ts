import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AyudaPage } from 'src/app/ayuda/ayuda.page';
import { ResetpasswordPage } from 'src/app/resetpassword/resetpassword.page';
import { DatosConductorService } from 'src/app/servicios/datos-conductor.service';

@Component({
  selector: 'app-perfil-conductor',
  templateUrl: './perfil-conductor.page.html',
  styleUrls: ['./perfil-conductor.page.scss'],
})
export class PerfilConductorPage implements OnInit {

  constructor(public dataService: DatosConductorService,
    public alertController: AlertController,
    public db: AngularFirestore,
    public toastController: ToastController,
    public AFA: AngularFireAuth,
    public router: Router,
    private modalController: ModalController) { }
    
    comuna:string;
    telefono:number;
    direccion:string;

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.comuna = this.dataService.getDataConductorPersona().p_comuna
    this.direccion = this.dataService.getDataConductorPersona().p_direccion
    this.telefono = this.dataService.getDataConductor().con_telefono
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
            this.db.collection('conductor').doc(this.dataService.getDataConductor().id_conductor).update({
              con_telefono: this.telefono
            }).catch(err=>console.log(err))
            this.db.collection('persona').doc(this.dataService.getDataConductor().id_persona).update({
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
  cancel(){
    this.ionViewWillEnter();
  }
  async ayuda(){
    const modal = await this.modalController.create({
                component: AyudaPage
      })
    await modal.present()
  }
}
