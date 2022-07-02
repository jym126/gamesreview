import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { ActionSheetController, ModalController, Platform } from '@ionic/angular';
import { DataLocalService } from 'src/app/data-local.service';
import { GameService } from 'src/app/gameServices.service';
import { Detalle } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
})
export class DetalleComponent implements OnInit {

  detalle: Detalle = {};
  id = this.gameServ.id;
  marcado = 'close-circle-outline';

  constructor(private gameServ: GameService,
              private platform: Platform,
              private mc: ModalController,
              private iab: InAppBrowser,
              private dataLocal: DataLocalService,
              private asc: ActionSheetController,
              private ss: SocialSharing) { }

  ngOnInit() {
    this.gameServ.getGame(this.id)
    .subscribe(resp => {this.detalle = resp;});
  }

  volver() {
    this.mc.dismiss();
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

  imprimir(tienda) {
    console.log(tienda);
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
    .subscribe(resp => this.detalle = resp);
    const {name, website, rating}: any = this.detalle;
    this.ss.share(
      website,
      name,
      null,
      'Rating: '+ rating.toString()
    );
  }

  //Método para añadir o quitar de favoritos
  onToggleFavorite(id) {
    this.gameServ.getGame(id)
    .subscribe(resp => this.dataLocal.guardarBorrarJuego(resp));
  }

}


