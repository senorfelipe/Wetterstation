import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  private apiUrl = 'http://localhost:8000/api/';
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
  getWindData(time: number){
    var today=  new Date();
    var yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<WindData[]>(this.apiUrl + 'wind/?start='+this.formatDate(today));
}



}

export interface WindData {
  id: Number,
  speed: Number,
  direction: Number,
  time: Date

}

export interface TemperatureData {
  id: Number,
  degrees: Number,
  time: Date
}
