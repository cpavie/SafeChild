import { Component } from '@angular/core';
import { ThemeService } from 'src/app/servicios/theme.service';

// Boton de acceso rapido para alternar claro/oscuro, pensado para
// vivir en el header de cada pantalla (junto a ayuda/logout) en vez
// de quedar escondido solo en la pagina de perfil.
@Component({
  selector: 'app-theme-toggle',
  template: `
    <ion-button fill="clear" (click)="toggle()">
      <ion-icon
        slot="icon-only"
        [name]="themeService.isDark() ? 'sunny-outline' : 'moon-outline'"
      ></ion-icon>
    </ion-button>
  `,
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggle() {
    this.themeService.setMode(this.themeService.isDark() ? 'light' : 'dark');
  }
}
