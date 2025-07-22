import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GameService } from '../gameServices.service';
import { Detalle, Game } from '../interfaces/interfaces';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ActionSheetController, ModalController, Platform, IonRefresher } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { DataLocalService } from '../data-local.service';
import { ThemeService } from '../theme.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { PushService } from '../services/push.service';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';
import { Capacitor } from '@capacitor/core';
import type { RefresherCustomEvent } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, AfterViewInit {
  @ViewChild('swiper') swiper?: SwiperContainer;

  @Input() id: number;
  marcado = 'close-circle-outline';
  games: Game = {};
  description: Detalle = {};
  oculto = 150;
  carga = false;
  leer = 'Leer mas...';

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: false,
    pagination: { clickable: true },
    breakpoints: {
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 }
    }
  };

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private asc: ActionSheetController,
    private dataLocal: DataLocalService,
    private ts: ThemeService,
    private platform: Platform,
    private iab: InAppBrowser,
    private pushNot: PushService
  ) {}

  ngOnInit() {
    this.getGames();
    this.initializePushNotifications();
  }

  ngAfterViewInit() {
    if (this.swiper) {
      Object.assign(this.swiper, this.swiperConfig);
      // No inicializamos aquí porque no hay datos aún
    }
  }

  private async initializePushNotifications() {
    if (Capacitor.isNativePlatform()) {
      try {
        await this.pushNot.pushNotification();
      } catch (error) {
        console.error('Error en push notifications:', error);
      }
    }
  }

  getGames() {
    this.gameServ.getGames().subscribe(resp => {
      this.games = resp;
    });
  }

  onSlideChange() {
    this.oculto = 0;
    this.description = {};
    this.leer = 'Leer mas...';
  }

async verDetalle(id: number) {
  const topModal = await this.mc.getTop();
  if (!topModal) {
    this.gameServ.id = id;
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: { id }
    });
    await modal.present();
  }
}


  sinopsis(id: number) {
    if (this.leer === 'Leer mas...') {
      this.oculto = 5000;
      this.gameServ.getGame(id).subscribe(resp => {
        this.description = resp;
      });
      this.leer = 'Leer menos';
    } else {
      this.description = {};
      this.leer = 'Leer mas...';
    }
  }

  async onOpenMenu(id: number) {
    const gameInFavorites = this.dataLocal.gameInFavorites(id);

    const actionSheet = await this.asc.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => this.onShareGame(id)
        },
        {
          text: gameInFavorites ? 'Quitar de favoritos' : 'Añadir a favoritos',
          icon: gameInFavorites ? 'heart' : 'heart-outline',
          handler: () => this.onToggleFavorite(id)
        },
        {
          text: 'Cancelar',
          icon: 'close-circle-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async onShareGame(id: number) {
    this.gameServ.getGame(id).subscribe(async resp => {
      this.description = resp;
      const { name, website, rating } = this.description;
      await Share.share({
        title: name,
        text: `Mira este juego: ${name} (Rating: ${rating}/5)`,
        url: website || 'https://rawg.io/',
        dialogTitle: 'Compartir juego'
      });
    });
  }

  onToggleFavorite(id: number) {
    this.gameServ.getGame(id).subscribe(resp => {
      this.dataLocal.guardarBorrarJuego(resp);
    });
  }

  changeTheme(event: CustomEvent) {
    event.detail.checked ? this.ts.enableDark() : this.ts.enableLight();
  }

  openWebBrowser(url: string) {
    if (this.platform.is('ios') || this.platform.is('android')) {
      const browser = this.iab.create(url);
      browser.show();
    } else {
      window.open(url, '_blank');
    }
  }

  doRefresh(event: RefresherCustomEvent) {
    this.carga = true;
    this.gameServ.getGames().subscribe(resp => {
      this.games = resp;
      this.carga = false;
      event.detail.complete();
      setTimeout(() => this.swiper?.initialize(), 100);
    });
  }
}
