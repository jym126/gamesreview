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

  // 1. Añadimos la propiedad id para solucionar los errores TS2339
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
    return this.postIGDB('games', query);
  }

  getGames(): Observable<any[]> {
    const query = `
      fields name, summary, rating, cover.url, first_release_date, slug;
      limit 24;
    `;
    return this.postIGDB('games', query);
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
    return this.postIGDB('games', query);
  }

  /**
   * Obtiene el detalle de un juego específico por ID.
   * Usamos .pipe(map(...)) para extraer el primer objeto res[0] y solucionar los errores TS2559.
   */
  getGame(id: number): Observable<any> {
    const query = `
      fields name, summary, rating, cover.url, websites.url, first_release_date, slug;
      where id = ${id};
    `;
    return this.postIGDB('games', query).pipe(
      map((res: any[]) => (res && res.length > 0 ? res[0] : null))
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
    return this.postIGDB('games', query);
  }

  /**
   * Formatea la URL de la portada a alta resolución
   */
  formatCoverUrl(url?: string, size: 't_cover_big' | 't_720p' | 't_1080p' = 't_cover_big'): string {
    if (!url) return 'assets/shapes/cover-placeholder.png';
    return 'https:' + url.replace('t_thumb', size);
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
  return this.postIGDB('games', query);
}
}