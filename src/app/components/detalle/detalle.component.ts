import { Component, Input, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { DataLocalService } from 'src/app/data-local.service';
import { GameService } from 'src/app/gameServices.service';
import { Detalle } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  standalone: false,
})
export class DetalleComponent implements OnInit {

  @Input() id: string | number = this.gameServ.id;
  
  detalle!: Detalle; 
  marcado = 'close-circle-outline';

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private dataLocal: DataLocalService,
    private asc: ActionSheetController
  ) { }

  ngOnInit() {
    if (this.id) {
      this.gameServ.getGame(+this.id).subscribe(resp => {
        this.detalle = resp;
      });
    }
  }

  volver() {
    this.mc.dismiss();
  }

  async openWebBrowser(web?: string) {
    if (!web) return;
    await Browser.open({ url: web });
  }

  imprimir(tienda: any) {
    console.log(tienda);
  }

  async onOpenMenu(id: string | number) {
    const gameInFavorites = this.dataLocal.gameInFavorites(+id);

    const actionSheet = await this.asc.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => this.onShareGame()
        },
        {
          text: 'Favoritos',
          icon: gameInFavorites ? 'heart' : 'heart-outline',
          handler: () => this.onToggleFavorite()
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

  async onShareGame() {
    if (!this.detalle) return;

    // Se utiliza 'url' o la primera web del array de 'websites'
    const { name, url, rating, websites } = this.detalle;
    const shareUrl = url || websites?.[0]?.url || 'https://www.igdb.com/';

    await Share.share({
      title: name || 'Juego',
      text: 'Echa un vistazo a este juego increíble',
      url: shareUrl,
      dialogTitle: rating ? `Valoración: ${rating.toFixed(0)}/100` : 'Compartir juego',
    });
  }

  onToggleFavorite() {
    if (this.detalle && Object.keys(this.detalle).length > 0) {
      this.dataLocal.guardarBorrarJuego(this.detalle);
    }
  }
}