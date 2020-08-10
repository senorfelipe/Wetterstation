import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  /** @private URL der REST-Schnittstellee */
  private apiUrl = 'http://localhost:8000/api/';
  /**@private Client für HTTP-Requests */
  private http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
  /**heutiges Datum  */
  today=new Date;
  

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
     // console.log([year, month, day].join('-'))
    return [year, month, day].join('-');
}
/**
 * @returns neuste Bilder
 * get-Request der neusten Bilder
 */
getrecentImages() {
  return this.http.get<ImageData[]>(this.apiUrl + 'images/recent/');
}

/**
 * @returns heutige Bilder
 * get-Request des heutigen Datums
 */
  getTodayImages() {
    let today=new Date;
    return this.http.get<ImageData[]>(this.apiUrl + 'images/?start='+this.formatDate(today));
  }
 
/**
 * @returns Bilder von gestern
 * get-Request für die gestrigen Bilder
 */
  getYesterdayImages(){
    let today=new Date;
    let yesterday=new Date();
    yesterday.setDate(today.getDate()-1)
   
    return this.http.get<ImageData[]>(this.apiUrl + 'images/?start='+this.formatDate(yesterday)+'&end='+this.formatDate(today));
  }
/**
 * 
 * @param date 
 * @returns Bilder des übergebenen Datums
 */
 getDateImages(date:Date){
  let end=new Date() 
  end.setDate(date.getDate()+1)
   
  return this.http.get<ImageData[]>(this.apiUrl+'images/?start='+this.formatDate(date)+'&end='+this.formatDate(end));

 }


}
/** Interface der Bilddaten */
export interface ImageData {
  /**Bild-ID */
  id: Number,
  /**Bildpfad */
  image: String,
  /**Gemessenes Datum */
  measurement_time: Date
}
