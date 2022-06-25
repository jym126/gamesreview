/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { GameService } from '../gameServices.service';
import SwiperCore, { SwiperOptions } from 'swiper';
import { Detalle, Game } from '../interfaces/interfaces';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';//para compartir en redes sociales



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  games: Game = {};
  description: Detalle = {};
  oculto = 150;
  leer = 'Leer mas...';


  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 1,
    navigation: false,
    pagination: { clickable: true },
    scrollbar: { draggable: true }
  };

  onSlideChange() {
    this.oculto=0;
    this.description = {};
    this.leer = `Leer mas...`;
  }

  constructor(private gameServ: GameService,
              private mc: ModalController,
              private ss: SocialSharing,
              private asc: ActionSheetController) {}

  ngOnInit() {
    this.getGames();
  }


  getGames() {
    this.gameServ.getGames()
    .subscribe(resp => {this.games = resp; });
  }

  async verDetalle(id: number) {
    this.gameServ.id = id;
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: {
        id
      }
    });
    modal.present();
  }

  sinopsis(id) {
    if(this.leer === 'Leer mas...') {
    this.oculto = 5000;
    this.gameServ.getGame(id)
    .subscribe(resp => this.description = resp);
    this.leer = 'Leer menos';
    }else {
      this.description = {};
      this.leer = 'Leer mas...';
    }
  }

  async onOpenMenu(id) {

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
          icon: 'heart-outline',
          cssClass: '',
          handler: ()=> this.onToggleFavorite()
        },

        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
          cssClass: 'cancel'
        }
      ]

    });

    await actionSheet.present();
  }

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

  onToggleFavorite() {
    console.log('favorite');
}
}
