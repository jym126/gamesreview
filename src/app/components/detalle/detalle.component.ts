import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ModalController, Platform } from '@ionic/angular';
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

  constructor(private gameServ: GameService,
              private platform: Platform,
              private mc: ModalController,
              private iab: InAppBrowser) { }

  ngOnInit() {
    this.gameServ.getGame(this.id)
    .subscribe(resp => {this.detalle = resp;});
  }

  volver() {
    this.mc.dismiss();
  }

  //Para abrir el artículo en la web o el webkit
  openArticle(web) {
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

}


