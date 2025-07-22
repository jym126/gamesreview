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

  games: Game = {};
  value = 'Nombre del juego';
  textoBuscar = '';
  spinner = false;

  constructor(private gameServ: GameService,
              private mc: ModalController,
              private loadingController: LoadingController) {}

  findGame(event) {
    this.spinner = true;
    const pelicula = event.detail.value;
    this.gameServ.findGame(pelicula)
    .subscribe(resp => this.games = resp);
    this.finding();
  }

  onClick() {
    this.value = '';
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

  finding() {
    setTimeout(() => {
      this.spinner = false;
    }, 2000);
  }

}
