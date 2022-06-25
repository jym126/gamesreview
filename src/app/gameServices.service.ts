import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  id: number;

  time = Date();
  time2 = new Date();

  url = environment.url;
  apiKey = environment.apiKey;

  constructor(private http: HttpClient, public dp: DatePipe) { }

  fecha1() {
    const lastweek = new Date(this.time2.getFullYear(), this.time2.getMonth()-1, this.time2.getDate());
    const time2 = this.dp.transform(lastweek, 'yyyy-MM-dd');
    return time2;
  }

  fecha2() {
    const time = this.dp.transform(this.time, 'yyyy-MM-dd');
    return time;
  }

  getGames() {
    return this.http.get(`${this.url}?key=${this.apiKey}&dates=${this.fecha1()},${this.fecha2()}&pages=1,2,3`);
  }

  getGame(id) {
    return this.http.get(`${this.url}/${id}?key=${this.apiKey}&dates=${this.fecha1()},${this.fecha2()}&pages=1,2,3`);
  }

  findGame(name) {
    return this.http.get(`${this.url}?key=${this.apiKey}&search=${name}`);
  }
}
