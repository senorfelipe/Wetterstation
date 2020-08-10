import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  /**Server IP */
  private apiUrl = 'http://127.0.0.1:8000/api/';
  /**http Client */
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }
/**
 * 
 * @param date Datumseingabe
 * formatiert den Timestamp für get-Request
 */
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
/**
 * 
 * @param time Übergebene Zahl der Tage, die betrachtet werden sollen.
 * get-Request für die gewählten
 */
  getTemperatures(time: number) {

    var today=  new Date();
    var yesterday = today.getDate()-time;
    today.setDate(yesterday);
    return this.http.get<TemperatureData[]>(this.apiUrl + 'temps/aggregate/?start='+this.formatDate(today));

  }  
  /**
   * 
   * @param time Datumsangabe
   * @returns get-request der Winddaten
   * Anforderungen haben sich geändert, nicht länger relevant
   */
  getWindData(time: number){
    let today=  new Date();
  return  this.http.get<WindData[]>(this.apiUrl + 'wind/recent/?start='+this.formatDate(today));
}
/**
 * 
 * @param start Startdatum
 * @param end Enddatum
 * get-Request der Winddaten für angegebenen Zeitraum
 * Anforderungen geändert, nicht länger relevant
 */
getWindDataFrame(start:Date,end:Date){
  return this.http.get<WindData[]>(this.apiUrl+'wind/recent/?start='+this.formatDate(start)+'&end='+this.formatDate(end));

}
/**
 * 
 * @param start Startdatum
 * @param end Enddatum
 *  get-request der übergebenen Zeitspanne
 * 
 */
getTemperaturesDataFrame(start:Date,end:Date){
  return this.http.get<TemperatureData[]>(this.apiUrl+'temps/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));

}

/**
 * @returns neuste Winddaten
 * get-request der neusten Winddaten
 */
getRecentWind(){
  return this.http.get<WindData[]>(this.apiUrl+'wind/recent')
}


}

/**Winddaten
 */
export interface WindData {
  /**ID der Winddaten */
  id: Number,
  /**Windgeschwindigkeit */
  speed: Number,
  /**Windrichtung in Grad */
  direction: Number,
  /**Zeit der Messung */
  measure_time: Date

}

export interface TemperatureData {
  /**ID der Temperaturdaten */
  id: Number,
  /**Temperatur */
  degrees: Number,
  /**Zeit der Messung */
  measure_time: Date
}

