import { Component } from '@angular/core';
import { AuthService } from "../servicios/auth.service";
import { ModalController, ToastController } from "@ionic/angular";
import { ResetpasswordPage } from '../resetpassword/resetpassword.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  email:string;
  password:string;
  type:string;

  constructor(private authService: AuthService, private toast : ToastController, private modalCtrl: ModalController) {}
  
  async goResetPassword(){
    const modal = await this.modalCtrl.create({
          component: ResetpasswordPage
        })
        await modal.present();
  }
  
  async presentToast() {
    const toast = await this.toast.create({
      message: 'Llene todos los campos.',
      duration: 2000,
    });
    toast.present();
  }

  onSubmitLogin(){
    if (this.type == null || this.password == null || this.email ==null) {
      this.presentToast();
    }else{
      this.authService.login(this.email,this.password, this.type)}
  }
}
