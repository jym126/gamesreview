import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab3PageRoutingModule } from './tab3-routing.module';
import { Tab3Page } from './tab3.page';
import { register } from 'swiper/element/bundle';

// Registra los componentes de Swiper
register();

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab3PageRoutingModule
  ],
  declarations: [Tab3Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Necesario para componentes web
})
export class Tab3PageModule {}