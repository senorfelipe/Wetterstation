import { Component,ChangeDetectionStrategy, OnInit, } from "@angular/core";
import { ImageData, ImageService } from "../image-data.service";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';

import { Gallery, GalleryItem, ImageItem } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';

import 'hammerjs';


declare var myFunction;
declare var myTodayFunction;
declare var myLastWeekFunction;
declare var myOlderFunction;



@Component({
  selector: "app-webcam",
  templateUrl: "./webcam.component.html",
  styleUrls: ["./webcam.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebcamComponent implements OnInit {
  recentPics: GalleryItem[];
  todayPics:GalleryItem[];

  TodayImages: ImageData[] =[];
  RecentImages: ImageData[] = [];
  ImageService: ImageService;
  destroyed: Subject<boolean>;
  panelOpenState = false;

  CallMyFunction() {
    myFunction();
    myTodayFunction();
    myLastWeekFunction();
    myOlderFunction();
    
  }

  constructor(ImageService: ImageService,public gallery: Gallery, public lightbox: Lightbox) {
    this.ImageService = ImageService;
  }

  ngOnInit() {
    
    this.ImageService.getrecentImages()
      .subscribe((data) => {
        this.RecentImages = data;
        this.loadrecentPics();
      })
      console.log(this.recentPics)

    this.ImageService.getTodayImages()
    .subscribe((data)=>{
      this.TodayImages=data;
    })

 
      // This is for Lightbox example
      this.gallery.ref('lightbox', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.recentPics);
      //this.gallery.ref('today', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.todayPics);
    }
  

    loadrecentPics(){
      this.recentPics=this.RecentImages.map(data => {
        return new ImageItem({src:data.image,thumb:data.image})
      });
    }
    
 

    openLightbox(index:number,lightboxid:string) {
      
      console.log(this.recentPics)
      this.lightbox.open(index, lightboxid);
    }



  

  ngOnDestroy() {
    this.destroyed.next(true);
  }

  getImageLocation() {
    console.log(this.RecentImages.map((data) => data.image));
    return this.RecentImages.map((data) => data.image);
  }

  getImageDate() {
    console.log(this.RecentImages.map((data) => data.measurement_time));
    return this.RecentImages.map((data) => data.measurement_time);
  }



  
}

export class NgbdDropdownBasic {
  
}
