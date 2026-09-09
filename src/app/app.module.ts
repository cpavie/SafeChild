import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from "@angular/fire/compat";
import { environment } from "../environments/environment";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { Geolocation } from "@awesome-cordova-plugins/geolocation/ngx";
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AngularFireAuthModule } from "@angular/fire/compat/auth";

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        AngularFireAuthModule],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        Geolocation,
        AndroidPermissions
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
