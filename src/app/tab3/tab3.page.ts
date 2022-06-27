/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { DataLocalService } from '../data-local.service';
import SwiperCore, { SwiperOptions } from 'swiper';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ModalController } from '@ionic/angular';
import { Detalle } from '../interfaces/interfaces';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  get juegosFavoritos(): Detalle[] {
    return this.dataLocal.getLocalGames;
  }

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 1,
    navigation: false,
    pagination: { clickable: true },
    scrollbar: { draggable: true }
  };

  constructor(private dataLocal: DataLocalService,
              private mc: ModalController) {}


  ngOnInit() {
   }

  async verDetalle(id: number) {
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: {
        id
      }
    });
    modal.present();
  }

}
