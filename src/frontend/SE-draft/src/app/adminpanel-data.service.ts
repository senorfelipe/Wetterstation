import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AdminpanelDataService {
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

  getSolarDataFrame(start:Date,end:Date){
    return this.http.get<SolarData[]>(this.apiUrl+'solarcell/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }

  getBatteryDataFrame(start:Date,end:Date){
    return this.http.get<BatteryData[]>(this.apiUrl+'battery/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }
}

export interface SolarData {
  id: Number,
  current: Number,
  voltage: Number,
  measure_time: Date
}

export interface BatteryData {
  id: Number,
  current: Number,
  voltage: Number,
  degrees: Number,
  measure_time: Date
}
