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
/**
 * 
 * @param date angegebenes Datum
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
 * get-request Solardaten
 * @param time Übergebene Zahl der Tage, die betrachtet werden sollen.
 */
  getSolarData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<SolarData[]>(this.apiUrl + 'solarcell/aggregate/?start='+this.formatDate(today));
  }
/**
 * get-request Batteriedaten
 * @param time Übergebene Zahl der Tage, die betrachtet werden sollen.
 */
  getBatteryData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<BatteryData[]>(this.apiUrl + 'battery/aggregate/?start='+this.formatDate(today));
  }

  /**
   * get-request Raspberry Pi Daten
   * @param time Übergebene Zahl der Tage, die betrachtet werden sollen.
   */
  getRaspberryData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<SolarData[]>(this.apiUrl + 'solarcell/aggregate/?start='+this.formatDate(today));
  }
/**
 * get-request Datenvolumen
 * @param time Übergebene Zahl der Tage, die betrachtet werden sollen.
 */
  getVolumeData(time: number){
    let today=  new Date();
    let yesterday = today.getDate()-time;
    today.setDate(yesterday);
  
  return  this.http.get<VolumeData[]>(this.apiUrl + 'data-volume/?start='+this.formatDate(today));
  }
/**
 * get-request der übergebenen Zeitspanne Solardaten
 * @param start Startdatum
 * @param end Enddatum
 */
  getSolarDataFrame(start:Date,end:Date){
    return this.http.get<SolarData[]>(this.apiUrl+'solarcell/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }
/**
 * get-request der übergebenen Zeitspanne Batteriedaten
 * @param start Startdatum
 * @param end Enddatum
 */
  getBatteryDataFrame(start:Date,end:Date){
    return this.http.get<BatteryData[]>(this.apiUrl+'battery/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }
/**
 * get-request der übergebenen Zeitspanne Raspberry Pi Daten
 * @param start Startdatum
 * @param end Enddatum
 */
  getRaspberryDataFrame(start:Date,end:Date){
    return this.http.get<RaspberryData[]>(this.apiUrl+'solarcell/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }
/**
 * get-request der übergebenen Zeitspanne Datenvolumen
 * @param start Startdatum
 * @param end Enddatum
 */
  getVolumeDataFrame(start:Date,end:Date){
    return this.http.get<VolumeData[]>(this.apiUrl+'solarcell/aggregate/?start='+this.formatDate(start)+'&end='+this.formatDate(end));
  }
}

export interface SolarData {
  /**ID */
  id: Number,
  /**Stromstärke Solardaten */
  current: Number,
  /**Spannung Solardaten */
  voltage: Number,
  /**Aufnahmedatum */
  measure_time: Date
}

export interface BatteryData {
  /**Identifkation Batteriedaten */
  id: Number,
  /**Stromstärke Batterie */
  current: Number,
  /**Spannung Batterie */
  voltage: Number,
  /** Temperatur der Batterie */
  degrees: Number,
  /**Aufnahmedatum */
  measure_time: Date
}


export interface RaspberryData {
  /**Identifikation */
  id: Number,
  /**Stromstärke des Raspberry Pi */
  current: Number,
  /**Spannung des Raspberry Pi */
  voltage: Number,
  /**Aufnahmedatum */
  measure_time: Date
}

export interface VolumeData {
  /**Identifikation Datenpunkte des Datenvolumen */
  id: Number,
  /** Akkumulierte Bildgröße des Datenpunktes */
  image_size: Number
}
