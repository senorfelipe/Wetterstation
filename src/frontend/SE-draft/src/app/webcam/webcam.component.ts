import { Component,ChangeDetectionStrategy, OnInit, } from "@angular/core";
import { ImageData, ImageService } from "../image-data.service";
import { Observable, Subject } from "rxjs";
import { takeUntil, throttleTime } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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

  DatePics: GalleryItem[];
  DateImages: ImageData[] = [];


  ImageService: ImageService;

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  startdateEvents: Date;
  panelOpenState = false;


  constructor(ImageService: ImageService,public gallery: Gallery,public today: Gallery,public yesterday:Gallery,public dategallery:Gallery, public lightbox: Lightbox) {
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
        this.gallery.ref('yesterday', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.yesterdayPics);
      })
    }

    
    openLightbox(index:number,galleryid:string) {
     
      this.lightbox.open(index, galleryid);
    }
    
    
    loaddatePics(){
      this.ImageService.getDateImages(this.startdateEvents)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data)=>{
        this.DateImages=data;
        this.DatePics=this.DateImages.map(data=>{
          return new ImageItem({src:data.image,thumb:data.image})
        });
        this.today.ref('dategallery', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.DatePics);
      })
    }


    /*Eventhandles for Timeframe */
    addDateEvent(event: MatDatepickerInputEvent<Date>) {
      this.startdateEvents=event.value;
    console.log(this.startdateEvents)
      this.loaddatePics();

  }
  

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  }

export class NgbdDropdownBasic {
  
}
