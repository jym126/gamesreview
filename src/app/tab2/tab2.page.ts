import { Component } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
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

  // ✅ CORREGIDO: Declarado como Array de Game
  games: Game[] = [];
  value = 'Nombre del juego';
  textoBuscar = '';
  spinner = false;

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private loadingController: LoadingController
  ) {}

  findGame(event: any) {
    const texto: string = event.detail.value;

    // Si el texto de búsqueda está vacío, limpiamos los resultados
    if (!texto || texto.trim().length === 0) {
      this.spinner = false;
      this.games = [];
      return;
    }

    this.spinner = true;
    this.gameServ.findGame(texto).subscribe({
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
   * Helper para formatear las portadas de IGDB (HTTPS y resolución t_cover_big)
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

  onClick() {
    this.value = '';
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