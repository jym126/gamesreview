import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; // ✅ Añadido ElementRef
import { DataLocalService } from '../data-local.service';
import { DetalleComponent } from '../components/detalle/detalle.component';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { GameService } from '../gameServices.service';
import { Share } from '@capacitor/share';
import { register } from 'swiper/element/bundle'; // ✅ Asegúrate de importar register

// Registrar Web Components de Swiper
register();

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {

  // ✅ CORREGIDO: Usar ElementRef para obtener el elemento del DOM
  @ViewChild('swiper') swiper?: ElementRef;

  marcado = 'close-circle-outline';

  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: false,
    pagination: { clickable: true },
    scrollbar: { draggable: true }
  };

  constructor(
    private dataLocal: DataLocalService,
    private mc: ModalController,
    private asc: ActionSheetController,
    private gameServ: GameService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      // ✅ CORREGIDO: Acceder mediante nativeElement
      if (this.swiper?.nativeElement) {
        Object.assign(this.swiper.nativeElement, this.swiperConfig);
        this.swiper.nativeElement.initialize();
      }
    });
  }

  get juegosFavoritos(): any[] {
    const defaultImage = 'assets/splash.png';
    const favs = this.dataLocal.getLocalGames || [];

    return favs.map((game: any) => {
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
  }

  async verDetalle(id: number) {
    this.gameServ.id = id;
    const modal = await this.mc.create({
      component: DetalleComponent,
      componentProps: { id }
    });
    await modal.present();
  }

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
          icon: this.marcado,
          role: 'cancel',
          cssClass: 'cancel'
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
        text: `¡Mira este juego en mi lista de favoritos!: ${name}`,
        url: mainWebsite,
        dialogTitle: name
      });
    });
  }

  onToggleFavorite(id: number) {
    this.gameServ.getGame(id).subscribe((resp: any) => {
      if (resp) {
        this.dataLocal.guardarBorrarJuego(resp);
      }
    });
  }
}