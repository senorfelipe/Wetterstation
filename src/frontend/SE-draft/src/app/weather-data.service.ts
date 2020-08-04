import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  private apiUrl = 'http://127.0.0.1:8000/api/';
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
    return this.http.get<TemperatureData[]>(this.apiUrl + 'temps/aggregate/?start='+this.formatDate(today));

  }  
  getWindData(time: number){
    let today=  new Date();
 
  
  return  this.http.get<WindData[]>(this.apiUrl + 'wind/recent/?start='+this.formatDate(today));
}

getWindDataFrame(start:Date,end:Date){
  return this.http.get<WindData[]>(this.apiUrl+'wind/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));

}

getTemperaturesDataFrame(start:Date,end:Date){
  return this.http.get<TemperatureData[]>(this.apiUrl+'temps/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));

}
getRecentWind(){
  return this.http.get<WindData[]>(this.apiUrl+'wind/recent')
}


}

export interface WindData {
  id: Number,
  speed: Number,
  direction: Number,
  measure_time: Date

}

export interface TemperatureData {
  id: Number,
  degrees: Number,
  measure_time: Date
}

