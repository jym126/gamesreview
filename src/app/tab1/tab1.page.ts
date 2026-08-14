import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { GameService } from '../gameServices.service';
import { DataLocalService } from '../data-local.service';
import { Game } from '../interfaces/interfaces';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  games: Game[] = [];
  carga: boolean = false;

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private asc: ActionSheetController,
    public dataLocal: DataLocalService
  ) {}

  ngOnInit() {
    this.getNovedades();
  }

  /**
   * Obtiene los últimos 20 lanzamientos desde el servicio
   */
  getNovedades() {
    this.carga = true;
    this.gameServ.getNovedades(20).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        this.carga = false;
      },
      error: (err) => {
        console.error('Error al obtener novedades:', err);
        this.carga = false;
      }
    });
  }

  /**
   * Formatea la URL de la portada a HTTPS y alta resolución.
   * Si no dispone de imagen, asigna la imagen local por defecto.
   */
  private formatGameImages(gamesList: any[]): Game[] {
    const defaultImage = 'assets/noPicture.png';

    return gamesList.map(game => {
      if (game.cover && game.cover.url) {
        let imageUrl = game.cover.url;
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
        game.background_image = imageUrl.replace('t_thumb', 't_cover_big');
      } else {
        game.background_image = defaultImage;
      }
      return game;
    });
  }

  /**
   * Abre la ficha del juego en el modal
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
   * Abre el ActionSheet con las opciones de Compartir y Favoritos
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
          role: 'cancel',
          cssClass: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  /**
   * Comparte la información del juego a través de Capacitor Share
   */
  async onShareGame(id: number) {
    this.gameServ.getGame(id).subscribe(async (gameDetail: any) => {
      if (!gameDetail) return;
      const { name, websites } = gameDetail;
      const mainWebsite = websites && websites.length > 0 ? websites[0].url : 'https://www.igdb.com/';

      await Share.share({
        title: name,
        text: `¡Echa un vistazo a este juego increíble!: ${name}`,
        url: mainWebsite,
        dialogTitle: name
      });
    });
  }

  /**
   * Añade o elimina el juego de la lista local de favoritos
   */
  onToggleFavorite(id: number) {
    this.gameServ.getGame(id).subscribe((resp: any) => {
      if (resp) {
        this.dataLocal.guardarBorrarJuego(resp);
      }
    });
  }

  /**
   * Permite actualizar la lista al deslizar hacia abajo
   */
  doRefresh(event: RefresherCustomEvent) {
    this.gameServ.getNovedades(20).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        event.detail.complete();
      },
      error: (err) => {
        console.error('Error al refrescar novedades:', err);
        event.detail.complete();
      }
    });
  }
}