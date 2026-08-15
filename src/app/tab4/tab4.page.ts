import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { register } from 'swiper/element/bundle';

import { GameService } from '../gameServices.service';
import { DataLocalService } from '../data-local.service';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { Game } from '../interfaces/interfaces';

// Registrar Web Components de Swiper
register();

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {

  @ViewChild('swiper') swiper?: ElementRef;

  games: Game[] = [];
  carga: boolean = false;

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private asc: ActionSheetController,
    private dataLocal: DataLocalService,
    private iab: InAppBrowser
  ) {}

  ngOnInit() {
    this.getProximos();
  }

  /**
   * Carga los próximos lanzamientos desde IGDB
   */
  getProximos() {
    this.carga = true;
    this.gameServ.getProximosLanzamientos(20).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        this.carga = false;
        this.actualizarSwiper();
      },
      error: (err) => {
        console.error('Error al obtener próximos lanzamientos:', err);
        this.carga = false;
      }
    });
  }

  /**
   * Formatea las imágenes de IGDB a HTTPS y alta resolución (t_cover_big)
   */
  private formatGameImages(gamesList: any[]): Game[] {
    return gamesList.map(game => {
      if (game.cover && game.cover.url) {
        let imageUrl = game.cover.url;
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
        game.background_image = imageUrl.replace('t_thumb', 't_cover_big');
      } else {
        game.background_image = 'assets/shapes/cover-placeholder.png';
      }
      return game;
    });
  }

  /**
   * Notifica a Swiper para refrescar su estructura cuando los datos cambian
   */
  private actualizarSwiper() {
    setTimeout(() => {
      if (this.swiper?.nativeElement) {
        this.swiper.nativeElement.swiper?.update();
      }
    }, 100);
  }

  /**
   * Abre el modal de detalle del juego
   */
  async verDetalle(id: number) {
    this.gameServ.id = id;
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: { id }
    });
    await modal.present();
  }

  /**
   * Alterna la visibilidad de la sinopsis larga
   */
  toggleSinopsis(game: any) {
    game.expanded = !game.expanded;
  }

  /**
   * Abre un enlace web seguro con InAppBrowser
   */
  abrirEnlaceIGDB(slug?: string) {
    const url = slug ? `https://www.igdb.com/games/${slug}` : 'https://www.igdb.com/';
    this.iab.create(url, '_system');
  }

  /**
   * Guarda o elimina un juego de favoritos usando la caché local o solicitándolo al servicio
   */
  onToggleFavorite(id: number) {
    const localGame = this.games.find(g => g.id === id);
    if (localGame) {
      this.dataLocal.guardarBorrarJuego(localGame);
    } else {
      this.gameServ.getGame(id).subscribe((resp: any) => {
        if (resp) {
          this.dataLocal.guardarBorrarJuego(resp);
        }
      });
    }
  }

  /**
   * Menú contextual de opciones para el juego seleccionado
   */
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
    const localGame = this.games.find(g => g.id === id);
    const name = localGame?.name || 'Próximo Lanzamiento';
    const url = localGame?.slug ? `https://www.igdb.com/games/${localGame.slug}` : 'https://www.igdb.com/';

    await Share.share({
      title: name,
      text: `¡Próximo juego en camino!: ${name}`,
      url: url,
      dialogTitle: 'Compartir juego'
    });
  }

  /**
   * Recarga de la lista con el gesto Pull to Refresh
   */
  doRefresh(event: RefresherCustomEvent) {
    this.gameServ.getProximosLanzamientos(20).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        this.actualizarSwiper();
        event.detail.complete();
      },
      error: (err) => {
        console.error('Error al refrescar próximos lanzamientos:', err);
        event.detail.complete();
      }
    });
  }
}