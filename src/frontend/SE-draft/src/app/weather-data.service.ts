import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  private apiUrl = 'http://192.168.0.22:8000/api/';
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  formatDate(date: Date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

  getTemperatures(time: number) {

    var today=  new Date();
    var yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
    console.log(this.http.get<TemperatureData[]>(this.apiUrl + 'temps/?start='+this.formatDate(today)));
    return this.http.get<TemperatureData[]>(this.apiUrl + 'temps/?start='+this.formatDate(today));

  }





  
}

export interface TemperatureData {
  id: Number,
  degrees: Number,
  time: Date
}
