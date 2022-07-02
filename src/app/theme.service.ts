
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
   }


  enableDark() {
    document.body.setAttribute('color-theme', 'dark');
  }

  enableLight() {
    document.body.setAttribute('color-theme', 'light');
  }
}
