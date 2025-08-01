import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';

@NgModule({
  imports: [
    IonicModule.forRoot(), // Asegúrate de usar forRoot()
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
  ],
  declarations: [Tab1Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Esto es esencial para componentes web
})
export class Tab1PageModule {}