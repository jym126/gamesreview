import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { GameService } from '../gameServices.service';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { DataLocalService } from '../data-local.service';
import { Share } from '@capacitor/share';
import { Game } from '../interfaces/interfaces';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {

  // ✅ CORREGIDO: Declarado como Array de Game en lugar de objeto individual
  games: Game[] = [];
  description: any = {};
  carga: boolean = false;

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private asc: ActionSheetController,
    private dataLocal: DataLocalService
  ) {}

  ngOnInit() {
    this.getProximos();
  }

  /**
   * Carga los próximos lanzamientos
   */
  getProximos() {
    this.carga = true;
    this.gameServ.getProximosLanzamientos(20).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        this.carga = false;
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
      }
      return game;
    });
  }

  /**
   * Abre el modal de detalle asignando la propiedad id en el servicio
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
   * Conmuta la visibilidad de la sinopsis sin realizar llamadas de más
   */
  toggleSinopsis(game: any) {
    game.expanded = !game.expanded;
  }

  /**
   * Guarda o elimina un juego de favoritos
   */
  onToggleFavorite(id: number) {
    this.gameServ.getGame(id).subscribe((resp: any) => {
      // resp ya es un objeto gracias al map((res: any[]) => res[0]) de GameService
      this.dataLocal.guardarBorrarJuego(resp);
    });
  }

  /**
   * Opciones del ActionSheet
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
    this.gameServ.getGame(id).subscribe(async (gameDetail: any) => {
      if (!gameDetail) return;
      const { name, websites } = gameDetail;
      const mainWebsite = websites && websites.length > 0 ? websites[0].url : 'https://www.igdb.com/';

      await Share.share({
        title: name,
        text: `¡Próximo lanzamiento en camino!: ${name}`,
        url: mainWebsite,
        dialogTitle: 'Compartir juego'
      });
    });
  }

  /**
   * Recarga de la lista
   */
  doRefresh(event: RefresherCustomEvent) {
    this.gameServ.getProximosLanzamientos(20).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        event.detail.complete();
      },
      error: (err) => {
        console.error('Error al refrescar próximos lanzamientos:', err);
        event.detail.complete();
      }
    });
  }
}