/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public id?: number;
  private accessToken: string | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el token de Twitch usando el formato x-www-form-urlencoded
   */
  private getToken(): Observable<string> {
    if (this.accessToken) {
      return of(this.accessToken);
    }

    const body = new HttpParams()
      .set('client_id', environment.clientId)
      .set('client_secret', environment.clientSecret)
      .set('grant_type', 'client_credentials');

    return this.http.post<any>('https://id.twitch.tv/oauth2/token', body).pipe(
      tap(res => this.accessToken = res.access_token),
      switchMap(res => of(res.access_token as string))
    );
  }

  /**
   * Petición a IGDB con las cabeceras requeridas por su API v4
   */
  private postIGDB(endpoint: string, query: string): Observable<any> {
    return this.getToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Client-ID': environment.clientId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        });
        return this.http.post(`${environment.igdbUrl}/${endpoint}`, query, { headers });
      })
    );
  }

  /**
   * Obtiene las novedades (últimos 20 juegos lanzados)
   */
  getNovedades(limit: number = 20): Observable<any[]> {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const query = `
      fields name, summary, rating, cover.url, first_release_date, slug;
      where first_release_date != null & first_release_date <= ${currentTimestamp};
      sort first_release_date desc;
      limit ${limit};
    `;
    return this.postIGDB('games', query).pipe(
      map(res => this.formatGamesList(res))
    );
  }

  getGames(): Observable<any[]> {
    const query = `
      fields name, summary, rating, cover.url, first_release_date, slug;
      limit 24;
    `;
    return this.postIGDB('games', query).pipe(
      map(res => this.formatGamesList(res))
    );
  }

  /**
   * Obtiene juegos mejor valorados con filtro de puntuación
   */
  getStarGames(limit: number = 20): Observable<any[]> {
    const query = `
      fields name, summary, rating, cover.url, slug;
      where rating != null & total_rating_count > 50;
      sort rating desc;
      limit ${limit};
    `;
    return this.postIGDB('games', query).pipe(
      map(res => this.formatGamesList(res))
    );
  }

  /**
   * Obtiene el detalle COMPLETO de un juego específico por ID.
   * Solicita todas las propiedades y expansiones anidadas disponibles en la API v4 de IGDB.
   */
  getGame(id: number): Observable<any> {
    const query = `
      fields 
        name, summary, storyline, rating, rating_count, 
        aggregated_rating, aggregated_rating_count, total_rating, total_rating_count,
        first_release_date, slug, url, created_at, updated_at, hypes, version_title, game_type,
        cover.*,
        platforms.*,
        game_modes.*,
        genres.*,
        themes.*,
        player_perspectives.*,
        involved_companies.*, involved_companies.company.*,
        websites.*,
        screenshots.*,
        artworks.*,
        videos.*,
        similar_games.id, similar_games.name, similar_games.cover.url, similar_games.rating,
        dlcs.id, dlcs.name, dlcs.cover.url,
        expansions.id, expansions.name, expansions.cover.url,
        standalone_expansions.id, standalone_expansions.name, standalone_expansions.cover.url,
        remakes.id, remakes.name, remakes.cover.url,
        remasters.id, remasters.name, remasters.cover.url,
        parent_game.id, parent_game.name, parent_game.cover.url,
        franchise.name, franchises.name,
        collections.name,
        game_engines.name,
        keywords.name,
        age_ratings.*,
        alternative_names.*,
        release_dates.*, release_dates.platform.name,
        multiplayer_modes.*;
      where id = ${id};
    `;
    return this.postIGDB('games', query).pipe(
      map((res: any[]) => {
        if (!res || res.length === 0) return null;
        return this.formatGameDetail(res[0]);
      })
    );
  }

  /**
   * Busca juegos por nombre
   */
  findGame(name: string, limit: number = 20): Observable<any[]> {
    const query = `
      search "${name}";
      fields name, summary, rating, cover.url, slug;
      limit ${limit};
    `;
    return this.postIGDB('games', query).pipe(
      map(res => this.formatGamesList(res))
    );
  }

  /**
   * Obtiene los próximos lanzamientos (juegos que saldrán próximamente)
   */
  getProximosLanzamientos(limit: number = 20): Observable<any[]> {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const query = `
      fields name, summary, rating, cover.url, first_release_date, slug;
      where first_release_date != null & first_release_date > ${currentTimestamp};
      sort first_release_date asc;
      limit ${limit};
    `;
    return this.postIGDB('games', query).pipe(
      map(res => this.formatGamesList(res))
    );
  }

  /**
   * Formatea la URL de la portada o cualquier imagen de IGDB a alta resolución
   */
  formatCoverUrl(url?: string, size: 't_cover_big' | 't_720p' | 't_1080p' = 't_cover_big'): string {
    if (!url) return 'assets/shapes/cover-placeholder.png';
    return 'https:' + url.replace('t_thumb', size);
  }

  /**
   * Formatea automáticamente todas las URLs de imágenes contenidas en el objeto de detalle
   */
  private formatGameDetail(juego: any): any {
    if (!juego) return juego;

    if (juego.cover?.url) {
      juego.cover.url = this.formatCoverUrl(juego.cover.url, 't_cover_big');
      juego.background_image = juego.cover.url;
    }

    if (juego.screenshots && Array.isArray(juego.screenshots)) {
      juego.screenshots = juego.screenshots.map((s: any) => ({
        ...s,
        url: this.formatCoverUrl(s.url, 't_720p')
      }));
    }

    if (juego.artworks && Array.isArray(juego.artworks)) {
      juego.artworks = juego.artworks.map((a: any) => ({
        ...a,
        url: this.formatCoverUrl(a.url, 't_720p')
      }));
    }

    if (juego.similar_games && Array.isArray(juego.similar_games)) {
      juego.similar_games = juego.similar_games.map((g: any) => ({
        ...g,
        cover: g.cover ? { ...g.cover, url: this.formatCoverUrl(g.cover.url, 't_cover_big') } : null
      }));
    }

    return juego;
  }

  /**
   * Formatea la URL de la portada para listados de juegos
   */
  private formatGamesList(games: any[]): any[] {
    if (!Array.isArray(games)) return [];
    return games.map(game => {
      if (game.cover?.url) {
        game.cover.url = this.formatCoverUrl(game.cover.url, 't_cover_big');
      }
      return game;
    });
  }
}