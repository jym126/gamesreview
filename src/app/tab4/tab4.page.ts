import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { ModalController, ActionSheetController, Platform } from '@ionic/angular';
import { GameService } from '../gameServices.service';
import { DataLocalService } from '../data-local.service';
import { PushService } from '../services/push.service';
import { ThemeService } from '../theme.service';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { Game, Detalle } from '../interfaces/interfaces';
import { SwiperContainer } from 'swiper/element';
import { IonHeader, IonToolbar, IonRow, IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  @ViewChild('swiper') swiper?: SwiperContainer;

  @Input() id;

  marcado = 'close-circle-outline';
  games: Game = {};
  description: Detalle = {};
  oculto = 150;
  carga = false;
  leer = 'Leer mas...';

  // Configuración moderna de Swiper
  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: { clickable: true },
    navigation: false,
    breakpoints: {
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 }
    }
  };

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private ss: SocialSharing,
    private asc: ActionSheetController,
    private dataLocal: DataLocalService,
    private ts: ThemeService,
    private platform: Platform,
    private iab: InAppBrowser,
    private pushNot: PushService
  ) { }

  ngOnInit() {
    this.getGames();
    this.pushNot.pushNotification();
  }

  ngAfterViewInit() {
    if (this.swiper) {
      // Configuración de swiper aquí
      Object.assign(this.swiper, {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: { clickable: true }
      });
    }
  }

  //Para obtener un unico juego por su id
  getGames() {
    this.gameServ.getStarGames()
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

    onSlideChange() {
    this.oculto = 0;
    this.description = {};
    this.leer = 'Leer mas...';
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
