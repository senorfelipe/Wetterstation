import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://127.0.0.1:8000/api/';
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getImages() {
    
    return this.http.get<ImageData[]>(this.apiUrl + 'images/');

  }
 
}

export interface ImageData {
  id: Number,
  image: String,
  time: Date
}
