import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Importa tu componente
import { DetalleComponent } from './detalle/detalle.component';

@NgModule({
  declarations: [
    DetalleComponent
  ],
  imports: [
    CommonModule,
    IonicModule // Habilita todos los componentes de Ionic (<ion-card>, <ion-icon>, etc.)
  ],
  exports: [
    DetalleComponent // Permite usarlo en cualquier parte del proyecto
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ComponentsModule { }