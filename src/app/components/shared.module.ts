import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [ThemeToggleComponent],
  exports: [ThemeToggleComponent],
})
export class SharedModule {}
