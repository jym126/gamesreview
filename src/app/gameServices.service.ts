/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  id: number;

  time = new Date();

  url = environment.url;
  apiKey = environment.apiKey;

  constructor(private http: HttpClient, public dp: DatePipe) { }

  fecha1() {
    const lastweek = new Date(this.time.getFullYear(), this.time.getMonth(), this.time.getDate()-7);
    const time = this.dp.transform(lastweek, 'yyyy-MM-dd');
    return time;
  }

  fecha2() {
    const today = new Date(this.time.getFullYear(), this.time.getMonth(), this.time.getDate()+5);
    const time = this.dp.transform(today, 'yyyy-MM-dd');
    return time;
  }

  fecha3() {
    const lastweek = new Date(this.time.getFullYear(), this.time.getMonth(), this.time.getDate());
    const time = this.dp.transform(lastweek, 'yyyy-MM-dd');
    return time;
  }

  getGames() {
    return this.http.get(`${this.url}?key=${this.apiKey}&dates=${this.fecha1()},${this.fecha2()}&pages=1,2,3&page_size=24`);
  }

  getStarGames() {
    return this.http.get(`${this.url}?key=${this.apiKey}&dates=${this.fecha3()},${this.fecha2()}&pages=1,2,3&page_size=20`);
  }

  getGame(id) {
    return this.http.get(`${this.url}/${id}?key=${this.apiKey}&dates=${this.fecha1()},${this.fecha2()}&pages=1,2,3`);
  }

  findGame(name) {
    return this.http.get(`${this.url}?key=${this.apiKey}&search=${name}`);
  }
}
