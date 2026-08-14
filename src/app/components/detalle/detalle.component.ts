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
  detalle: Detalle = {};
  marcado = 'close-circle-outline';

  constructor(
    private gameServ: GameService,
    private mc: ModalController,
    private dataLocal: DataLocalService,
    private asc: ActionSheetController
  ) { }

  ngOnInit() {
    if (this.id) {
      this.gameServ.getGame(this.id).subscribe(resp => {
        this.detalle = resp;
      });
    }
  }

  volver() {
    this.mc.dismiss();
  }

  // Abre la página web usando @capacitor/browser (funciona en Android, iOS y Web)
  async openWebBrowser(web?: string) {
    if (!web) return;
    await Browser.open({ url: web });
  }

  imprimir(tienda: any) {
    console.log(tienda);
  }

  // Abre el ActionSheet con las opciones
  async onOpenMenu(id: string | number) {
    const gameInFavorites = this.dataLocal.gameInFavorites(id);

    const actionSheet = await this.asc.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline', // Corregida mayúscula inicial
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

  // Método para compartir en redes usando el objeto ya cargado
  async onShareGame() {
    const { name, website, rating } = this.detalle;

    await Share.share({
      title: name || 'Juego',
      text: 'Echa un vistazo a este juego increíble',
      url: website,
      dialogTitle: rating ? `Valoración: ${rating}` : 'Compartir juego',
    });
  }

  // Añadir/quitar de favoritos sin volver a hacer la petición HTTP
  onToggleFavorite() {
    if (this.detalle && Object.keys(this.detalle).length > 0) {
      this.dataLocal.guardarBorrarJuego(this.detalle);
    }
  }
}