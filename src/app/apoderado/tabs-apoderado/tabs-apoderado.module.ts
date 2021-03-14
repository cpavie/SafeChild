import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsApoderadoPageRoutingModule } from './tabs-apoderado-routing.module';

import { TabsApoderadoPage } from './tabs-apoderado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsApoderadoPageRoutingModule
  ],
  declarations: [TabsApoderadoPage]
})
export class TabsApoderadoPageModule {}
