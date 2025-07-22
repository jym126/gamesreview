import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab4PageRoutingModule } from './tab4-routing.module';
import { Tab4Page } from './tab4.page';

// Importa la función register de Swiper
import { register } from 'swiper/element/bundle';

// Registra los componentes web de Swiper
register();

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule
  ],
  declarations: [Tab4Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Necesario para componentes web
})
export class Tab4PageModule {}