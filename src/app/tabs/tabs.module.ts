import { IonicModule } from '@ionic/angular';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule
  ],
  declarations: [
    TabsPage, 
  ],
  exports: [
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // ✅ Evita errores de compilación con elementos personalizados como ion-icon
  ]
})
export class TabsPageModule {}