import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { EditAlumnoPage } from '../apoderado/edit-alumno/edit-alumno.page';

/*
 * EditAlumnoPage se declara aqui y no en un modulo propio porque es un
 * modal, no una pagina con ruta: nadie navega a ella, solo la abre
 * inicio-apoderado con ModalController.
 *
 * Antes vivia en un EditAlumnoPageModule que ningun import ni ruta
 * referenciaba (el build lo avisaba: "edit-alumno.module.ts is part of
 * the TypeScript compilation but it's unused"). Ese modulo nunca se
 * cargaba, asi que Angular nunca le fijaba el ambito de directivas a la
 * plantilla: [(ngModel)] quedaba inerte, los campos aparecian vacios
 * aunque el componente tuviera los datos, y lo que el apoderado
 * escribiera se descartaba en silencio al confirmar. Las demas paginas
 * modales (ayuda, resetpassword, info-*) si tienen ruta y las precarga
 * PreloadAllModules, por eso no sufren esto.
 */
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [ThemeToggleComponent, EditAlumnoPage],
  exports: [ThemeToggleComponent, EditAlumnoPage],
})
export class SharedModule {}
