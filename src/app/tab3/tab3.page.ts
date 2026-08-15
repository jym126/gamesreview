import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { register } from 'swiper/element/bundle';

import { DataLocalService } from '../data-local.service';
import { GameService } from '../gameServices.service';
import { DetalleComponent } from '../components/detalle/detalle.component';

// Registrar Web Components de Swiper
register();

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  @ViewChild('swiper') swiper?: ElementRef;

  juegosFavoritos: any[] = [];
  marcado = 'close-circle-outline';

  constructor(
    private dataLocal: DataLocalService,
    private mc: ModalController,
    private asc: ActionSheetController,
    private gameServ: GameService
  ) {}

  /**
   * Ciclo de vida de Ionic: Se ejecuta CADA VEZ que el usuario entra a esta pestaña.
   */
  async ionViewWillEnter() {
    await this.cargarFavoritos();
  }

  /**
   * Carga y procesa los juegos guardados localmente
   */
  async cargarFavoritos() {
    const defaultImage = 'assets/shapes/cover-placeholder.png';
    const favs = (await this.dataLocal.getLocalGames) || [];

    this.juegosFavoritos = favs.map((game: any) => {
      const gameCopy = { ...game };

      if (gameCopy.background_image) {
        if (gameCopy.background_image.startsWith('//')) {
          gameCopy.background_image = 'https:' + gameCopy.background_image;
        }
      } else if (gameCopy.cover && gameCopy.cover.url) {
        let imageUrl = gameCopy.cover.url;
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
        gameCopy.background_image = imageUrl.replace('t_thumb', 't_cover_big');
      } else {
        gameCopy.background_image = defaultImage;
      }

      return gameCopy;
    });

    // Notificar a Swiper que la lista de slides se ha actualizado
    setTimeout(() => {
      if (this.swiper?.nativeElement) {
        this.swiper.nativeElement.swiper?.update();
      }
    }, 100);
  }

  async verDetalle(id: number) {
    this.gameServ.id = id;
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: { id }
    });
    await modal.present();

    // Al cerrar el modal, recargar por si se eliminó de favoritos desde la ficha
    await modal.onDidDismiss();
    await this.cargarFavoritos();
  }

  async onOpenMenu(game: any) {
    const gameInFavorites = this.dataLocal.gameInFavorites(game.id);

    const actionSheet = await this.asc.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => this.onShareGame(game)
        },
        {
          text: gameInFavorites ? 'Quitar de favoritos' : 'Añadir a favoritos',
          icon: gameInFavorites ? 'heart' : 'heart-outline',
          handler: () => this.onToggleFavorite(game)
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

  async onShareGame(game: any) {
    const name = game.name || 'Juego';
    const mainWebsite = game.websites && game.websites.length > 0 ? game.websites[0].url : 'https://www.igdb.com/';

    await Share.share({
      title: name,
      text: `¡Mira este juego en mi lista de favoritos!: ${name}`,
      url: mainWebsite,
      dialogTitle: name
    });
  }

  async onToggleFavorite(game: any) {
    // Guardar/borrar directo sin necesidad de peticiones HTTP adicionales
    await this.dataLocal.guardarBorrarJuego(game);
    await this.cargarFavoritos();
  }
}