import { Component,ChangeDetectionStrategy, OnInit, } from "@angular/core";
import { ImageData, ImageService } from "../image-data.service";
import { Observable, Subject } from "rxjs";
import { takeUntil, throttleTime } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';

import { Gallery, GalleryItem, ImageItem } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';

import 'hammerjs';



@Component({
  selector: "app-webcam",
  templateUrl: "./webcam.component.html",
  styleUrls: ["./webcam.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebcamComponent implements OnInit {
  
  todayPics:GalleryItem[];
  TodayImages: ImageData[] =[];

  recentPics: GalleryItem[];
  RecentImages: ImageData[] = [];

  yesterdayPics: GalleryItem[];
  YesterdayImages: ImageData[] = [];

  


  ImageService: ImageService;

  destroy$: Subject<boolean> = new Subject<boolean>();

  
  panelOpenState = false;


  constructor(ImageService: ImageService,public gallery: Gallery,public today: Gallery, public lightbox: Lightbox,public todayLightbox: Lightbox,public yesterday :Gallery,
    public yesterdayLightbox:Lightbox) {
    this.ImageService = ImageService;
  }

  ngOnInit() {
    
    this.ImageService.getrecentImages()
    .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.RecentImages = data;
        this.loadrecentPics();
      })
      this.gallery.ref('lightbox', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.recentPics);
      console.log(this.recentPics)


 
      // This is for Lightbox example
      
      console.log(this.gallery)

    }
  

    loadrecentPics(){
      this.recentPics=this.RecentImages.map(data => {
        return new ImageItem({src:data.image,thumb:data.image})
      });
    }
    
    loadtodayPics(){
      this.ImageService.getTodayImages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data)=>{
        this.TodayImages=data;
        this.todayPics=this.TodayImages.map(data=>{
          return new ImageItem({src:data.image,thumb:data.image})
        });
      this.today.ref('today', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.todayPics);
        
      })
 
    }

    loadyesterdayPics(){
      this.ImageService.getYesterdayImages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data)=>{
        this.YesterdayImages=data;
        this.yesterdayPics=this.YesterdayImages.map(data=>{
          return new ImageItem({src:data.image,thumb:data.image})
        });
      })
      this.today.ref('yesterday', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.yesterdayPics);
    }


    openLightbox(index:number,lightboxid:string) {
      console.log(this.todayLightbox)
      this.todayLightbox.open(index, lightboxid);
    }



  

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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
