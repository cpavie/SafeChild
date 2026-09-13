import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { ThemeService } from './servicios/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    // Se inyecta (sin usarse aca) solo para que se instancie temprano
    // y aplique el tema guardado antes de que se pinte la primera
    // pantalla.
    private themeService: ThemeService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      /*
       * Antes esto venia de @awesome-cordova-plugins, cuyos plugins
       * Cordova (splashscreen y statusbar) NO estaban instalados: las
       * llamadas no hacian nada en el dispositivo. Ahora se usan los
       * plugins oficiales de Capacitor.
       *
       * Dos precauciones deliberadas, y la segunda cuesta caro si se
       * olvida:
       *
       * 1. Se comprueba la plataforma con el Platform de Ionic
       *    ('hybrid' = Capacitor o Cordova) y NO con
       *    Capacitor.isNativePlatform(), para no tener que importar
       *    @capacitor/core aqui.
       * 2. Los plugins se cargan con import() dinamico, asi que en el
       *    navegador su chunk no se descarga nunca.
       *
       * El motivo: al importar @capacitor/core de forma estatica, su
       * runtime entra en el bundle web e interfiere con la
       * inicializacion de los componentes de Ionic. Los
       * ion-router-outlet se quedan sin la clase `hydrated`, las
       * transiciones no terminan y con ellas no se disparan los hooks
       * de ciclo de vida: el rastreo del conductor sale vacio. Se
       * comprobo en el navegador.
       */
      if (!this.platform.is('hybrid')) {
        return;
      }
      Promise.all([
        import('@capacitor/status-bar'),
        import('@capacitor/splash-screen'),
      ]).then(([{ StatusBar, Style }, { SplashScreen }]) => {
        StatusBar.setStyle({ style: Style.Default });
        SplashScreen.hide();
      });
    });
  }
}
