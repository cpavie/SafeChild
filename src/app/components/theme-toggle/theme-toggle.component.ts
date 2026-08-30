import { Component, Input } from '@angular/core';
import { ThemeService } from 'src/app/servicios/theme.service';

// Boton de acceso rapido para alternar claro/oscuro, pensado para
// vivir en el header de cada pantalla (junto a ayuda/logout) en vez
// de quedar escondido solo en la pagina de perfil.
//
// variant="chip" es la version con etiqueta del login: ahi no hay
// header donde apoyarse, y el pie de pagina tiene espacio para
// nombrar la accion en vez de dejar solo un icono suelto.
@Component({
  selector: 'app-theme-toggle',
  template: `
    <div *ngIf="variant === 'chip'" class="theme-chip" (click)="toggle()">
      <ion-icon [name]="themeService.isDark() ? 'sunny-outline' : 'moon-outline'"></ion-icon>
      <span>{{ themeService.isDark() ? 'Modo claro' : 'Modo oscuro' }}</span>
    </div>

    <div *ngIf="variant === 'fab'" class="sc-map-fab sc-glass" (click)="toggle()">
      <ion-icon [name]="themeService.isDark() ? 'sunny-outline' : 'moon-outline'"></ion-icon>
    </div>

    <ng-container *ngIf="variant === 'icon'">
      <ion-button class="sc-icon-btn" (click)="toggle()">
        <ion-icon
          slot="icon-only"
          [name]="themeService.isDark() ? 'sunny-outline' : 'moon-outline'"
        ></ion-icon>
      </ion-button>
    </ng-container>
  `,
  styles: [
    `
      .theme-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 999px;
        background: var(--sc-surface-2);
        border: 1px solid var(--sc-line);
        color: var(--sc-muted);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
      }

      .theme-chip ion-icon {
        font-size: 1rem;
      }
    `,
  ],
})
export class ThemeToggleComponent {
  @Input() variant: 'icon' | 'chip' | 'fab' = 'icon';

  constructor(public themeService: ThemeService) {}

  toggle() {
    this.themeService.setMode(this.themeService.isDark() ? 'light' : 'dark');
  }
}
