import { Component, OnInit, ViewChild } from '@angular/core';
import { DataLocalService } from '../data-local.service';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Detalle } from '../interfaces/interfaces';
import { GameService } from '../gameServices.service';
import { Share } from '@capacitor/share';
import { SwiperContainer } from 'swiper/element';
import { RemovehtmltagPipe } from '../removehtmltags.pipe'; 

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
   @ViewChild('swiper') swiper?: SwiperContainer;

  description: Detalle = {};
  marcado = 'close-circle-outline';

  // Configuración moderna de Swiper
  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: false,
    pagination: { clickable: true },
    scrollbar: { draggable: true }
  };

  ngOnInit() {}

  ngAfterViewInit() {
    // Inicialización manual del Swiper
    setTimeout(() => {
      if (this.swiper) {
        Object.assign(this.swiper, this.swiperConfig);
        this.swiper.initialize();
      }
    });
  }

  get juegosFavoritos(): Detalle[] {
    return this.dataLocal.getLocalGames;
  }

  constructor(private dataLocal: DataLocalService,
              private mc: ModalController,
              private asc: ActionSheetController,
              private gameServ: GameService,) {}

  async verDetalle(id: number) {
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: {
        id
      }
    });
    modal.present();
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
    async onShareGame(id) {
      this.gameServ.getGame(id)
      .subscribe(resp => this.description = resp);
      const {name, website, rating}: any = this.description;
      await Share.share({
        title: name,
        text: 'Echa un vistazo a este juego increible',
        url: website,
        dialogTitle: rating,
      });
    }

  //Método para añadir o quitar de favoritos
  onToggleFavorite(id) {
    this.gameServ.getGame(id)
    .subscribe(resp => this.dataLocal.guardarBorrarJuego(resp));
  }
}
