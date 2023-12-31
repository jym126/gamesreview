/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '../gameServices.service';
import SwiperCore, { SwiperOptions, Pagination, Navigation } from 'swiper';
import { Detalle, Game } from '../interfaces/interfaces';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ActionSheetController, ModalController, Platform } from '@ionic/angular';
import { Share } from '@capacitor/share';//para compartir en redes sociales
import { DataLocalService } from '../data-local.service';
import { ThemeService } from '../theme.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { PushService } from '../services/push.service'; //Para enviar notificaciones push a la app


SwiperCore.use([Pagination, Navigation]);
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  @Input() id;
  marcado = 'close-circle-outline';
  games: Game = {};
  description: Detalle = {};
  oculto = 150;
  carga = false;
  leer = 'Leer mas...';


  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 1,
    navigation: false,
    pagination: {
      clickable: true,
      type: 'bullets'
    },
    scrollbar: { draggable: true }
  };

  onSlideChange() {
    this.oculto=0;
    this.description = {};
    this.leer = `Leer mas...`;
  }

  constructor(private gameServ: GameService,
              private mc: ModalController,
              private asc: ActionSheetController,
              private dataLocal: DataLocalService,
              private ts: ThemeService,
              private platform: Platform,
              private iab: InAppBrowser,
              private pushNot: PushService
              ) {
              }

  ngOnInit() {
    this.getGames();
    this.pushNot.pushNotification();
  }

  //Para obtener un unico juego por su id
  getGames() {
    this.gameServ.getGames()
    .subscribe(resp => {this.games = resp; });
  }

  //Modal que nos lleva al componente paraver los detalles del juego
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

  //Muestra la sinopsis del juego
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
  async onShareGame(id) {
    this.gameServ.getGame(id)
    .subscribe(resp => this.description = resp);
    const {name, website, rating}: any = this.description;
    await Share.share({
      title: name,
      text: 'Echa un vistazo a este juego increible',
      url: website,
      dialogTitle: rating,
    });
  }

  //Método para añadir o quitar de favoritos
  onToggleFavorite(id) {
    this.gameServ.getGame(id)
    .subscribe(resp => this.dataLocal.guardarBorrarJuego(resp));
  }

  changeTheme(event) {
    event.detail.checked ? this.ts.enableDark() : this.ts.enableLight();
  }

    //Para abrir pagina del juego en la web o el webkit
    openWebBrowser(web) {
      if(this.platform.is('ios') || this.platform.is('android')){
      const browser = this.iab.create(web);
      browser.show();
      return;
    }
    window.open(web, '_blank');
    }

    doRefresh(event) {
      this.carga = true;
      setTimeout(() => {
        event.target.complete();
        this.carga = false;
        location.reload();
        // this.navCtrl.navigateRoot(['./tabs/tab1']);
      }, 200);
    }

}
