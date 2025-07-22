/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Detalle } from './interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  private _juegos: Detalle[] = [];
  temas: any[] = [];

  private _storage: Storage | null=null;

  constructor(private storage: Storage,
              private toastCtrl: ToastController) {
    this.init();
   }

   get getLocalGames() {
    return [...this._juegos];
   }

   async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.cargarFavoritos();
    this.cargarTema();
   }


   //Metodo para guardar el juego en favoritos
  guardarBorrarJuego(juego: Detalle) {

    const  result = this._juegos.find(game => game.id === juego.id);
    const existe = false;
    let mensaje = '';

    if (result) {
      this._juegos = this._juegos.filter(game => game.id !== juego.id);
      mensaje = 'Removido de favoritos';
    }else {
      this._juegos = [juego, ...this._juegos];
      // this._juegos.push(juego); es lo mismo que arriba
      mensaje = 'Agregada a favorito';
    }
    this.presentToast(mensaje);
    this._storage.set('juegos', this._juegos);
    return !existe;
  }

  async cargarFavoritos() {
    const juegos = await this._storage.get('juegos');
    this._juegos = juegos || [];
    return this._juegos;
  }

  //Mensaje de indicacion de que el juego se guardado o borrado de favorito
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'middle'
    });
    toast.present();
  }

  gameInFavorites(id) {
    return !!this._juegos.find(game => game.id === id);
  }

  guardarTema(tema: string) {
    this.temas = [];
    this.temas.push(tema);
    this._storage.set('tema', this.temas);
  }

async cargarTema() {
  const tema = await this._storage.get('tema');
  this.temas = tema || [];

  if(this.temas.length > 0 && this.temas[0] === 'dark') {
    document.body.setAttribute('color-theme', 'dark');
  } else {
    document.body.setAttribute('color-theme', 'light');
  }
  return this.temas;
}

}
