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
  /**Gallerie für die Bilder von heute*/
  todayPics:GalleryItem[];
  /**Bilder von Heute */
  TodayImages: ImageData[] =[];
/** Gallerie für die neusten Bilder */
  recentPics: GalleryItem[];
  /**neuste Bilder */
  RecentImages: ImageData[] = [];
/**Gallerie Bilder von gestern */
  yesterdayPics: GalleryItem[];
  /**Bilder von Gestern */
  YesterdayImages: ImageData[] = [];
/**Datepick Gallerie */
  DatePics: GalleryItem[];
  /**Datepick Bilder */
  DateImages: ImageData[] = [];

/**Service für die Bilder */
  ImageService: ImageService;

  /**Subject für Pipe beim fetchen */
  destroy$: Subject<boolean> = new Subject<boolean>();
  /**Hält das gewählte Datum */
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


      
      console.log(this.gallery)

    }
  
/**
 * initialisiert die neusten Bilder
 */
    loadrecentPics(){
      this.recentPics=this.RecentImages.map(data => {
        return new ImageItem({src:data.image,thumb:data.image})
      });
    }
    /**
     * lädt die Bilder des heutigen Tages
     */
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
/**
 * lädt die Bilder des gestrigen Tages
 */
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

  /**
   * Opens the lightbox
  */
    openLightbox(index:number,galleryid:string) {
     
      this.lightbox.open(index, galleryid);
    }
    
  /**
   * lädt die Bilder des gewählten Datums
  */
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


    /**
     * 
     * @param event Datepicker Event
     * Eventhandling des Datepickers
     */
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
/**@ignore */
export class NgbdDropdownBasic {
  
}
