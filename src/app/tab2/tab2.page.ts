import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { GameService } from '../gameServices.service';
import { Game } from '../interfaces/interfaces';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  games: Game[] = [];
  spinner = false;
  busquedaRealizada = false;

  constructor(
    private gameServ: GameService,
    private mc: ModalController
  ) {}

  findGame(event: any) {
    const texto: string = event.detail.value;

    // Si el cuadro de búsqueda se vacía, limpiamos la pantalla
    if (!texto || texto.trim().length === 0) {
      this.spinner = false;
      this.busquedaRealizada = false;
      this.games = [];
      return;
    }

    this.spinner = true;
    this.busquedaRealizada = true;

    this.gameServ.findGame(texto.trim()).subscribe({
      next: (resp: any[]) => {
        this.games = this.formatGameImages(resp || []);
        this.spinner = false;
      },
      error: (err) => {
        console.error('Error al buscar el juego:', err);
        this.spinner = false;
      }
    });
  }

  /**
   * Helper para asegurar que la portada siempre tenga una URL válida o una de respaldo
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
        // Imagen de respaldo por si el juego no tiene portada asignada en IGDB
        game.background_image = 'assets/shapes/cover-placeholder.png';
      }
      return game;
    });
  }

  async verDetalle(id: number) {
    this.gameServ.id = id;
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: { id }
    });
    await modal.present();
  }
}