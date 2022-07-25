/* eslint-disable no-underscore-dangle */

import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DataLocalService } from './data-local.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  renderer: Renderer2;

  constructor(
    private rendererFactory: RendererFactory2,
    private dataLocal: DataLocalService) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
   }


  enableDark() {
    document.body.setAttribute('color-theme', 'dark');
    this.dataLocal.guardarTema('dark');
  }

  enableLight() {
    document.body.setAttribute('color-theme', 'light');
    this.dataLocal.guardarTema('light');
  }
}
