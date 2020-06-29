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
  
    
    return this.http.get<TemperatureData[]>(this.apiUrl + 'temps/?start='+this.formatDate(today));

  }  
  getWindData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<WindData[]>(this.apiUrl + 'wind/?start='+this.formatDate(today));
  }

  getSolarData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<SolarData[]>(this.apiUrl + 'solarcell/?start='+this.formatDate(today));
  }

  getBatteryData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<BatteryData[]>(this.apiUrl + 'battery/?start='+this.formatDate(today));
  }

  getWindDataFrame(start:Date,end:Date){
    return this.http.get<WindData[]>(this.apiUrl+'wind/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }

  getTemperaturesDataFrame(start:Date,end:Date){
    return this.http.get<TemperatureData[]>(this.apiUrl+'temps/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }

  getSolarDataFrame(start:Date,end:Date){
    return this.http.get<SolarData[]>(this.apiUrl+'solarcell/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }

  getBatteryDataFrame(start:Date,end:Date){
    return this.http.get<BatteryData[]>(this.apiUrl+'battery/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
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

export interface SolarData {
  id: Number,
  current: Number,
  voltage: Number,
  time: Date
}

export interface BatteryData {
  id: Number,
  current: Number,
  voltage: Number,
  degrees: Number,
  time: Date
}
