/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { DataLocalService } from '../data-local.service';
import SwiperCore, { SwiperOptions } from 'swiper';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Detalle } from '../interfaces/interfaces';
import { GameService } from '../gameServices.service';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  description: Detalle = {};
  marcado = 'star-outline';

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
              private mc: ModalController,
              private asc: ActionSheetController,
              private ss: SocialSharing,
              private gameServ: GameService,) {}

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

    //Abre el actionsheet para poder compartir
    async onOpenMenu(id) {
      const gameInFavorites = this.dataLocal.gameInFavorites(id);

      const actionSheet = await this.asc.create({
        header: 'Opciones',
        buttons: [
          {
          text: 'Compartir',
          icon: 'Share-outline',
          handler: ()=> this.onShareGame(id)
          },
          {
            text: 'Favoritos',
            icon: gameInFavorites ? 'heart' : 'heart-outline', //Cambia el icono del corazón para saber si ya está o no en favoritos
            cssClass: '',
            handler: ()=> this.onToggleFavorite(id)
          },
          {
            text: 'Cancelar',
            icon: this.marcado,
            role: 'cancel',
            cssClass: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }

    //Método para compartir con otras aplicaciones
    onShareGame(id) {
      this.gameServ.getGame(id)
      .subscribe(resp => this.description = resp);
      const {name, website, rating}: any = this.description;
      this.ss.share(
        website,
        name,
        null,
        'Rating: '+ rating.toString()
      );
    }

  //Método para añadir o quitar de favoritos
  onToggleFavorite(id) {
    this.gameServ.getGame(id)
    .subscribe(resp => this.dataLocal.guardarBorrarJuego(resp));
  }
}
