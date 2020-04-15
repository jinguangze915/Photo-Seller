import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import {Observable} from 'rxjs';
import { finalize } from 'rxjs/operators'

@Injectable({
    providedIn: 'root'
})

export class GalleryService{
    subGalleryPass:BehaviorSubject<any> = new BehaviorSubject('');

    gallerySource: BehaviorSubject<any> = new BehaviorSubject({});
    subGallerySource: BehaviorSubject<any> = new BehaviorSubject({});
/*     subGallerySourceList: BehaviorSubject<any> = new BehaviorSubject({}); */
    priceList: BehaviorSubject<any> = new BehaviorSubject({});

  /*  gallerySource: BehaviorSubject<any> = new BehaviorSubject({});
    public gallery = this.gallerySource.asObservable();*/

    // subGallerySource: BehaviorSubject<any> = new BehaviorSubject({});
    // public subgallery = this.subGallerySource.asObservable();

    // priceListSource: BehaviorSubject<any> = new BehaviorSubject({});
    // public priceList = this.priceListSource.asObservable();


    constructor(
        private http: HttpClient,
        private router: Router) {
    }

    getGalleryById(password){
        return this.http.get('/data/gallery/' + password).map((data)=> data);
    }
    changeSubGallery(password){
      this.getSubGalleryByPassword(password).subscribe((data:any)=> {
        if (data.status) {
          // this.galleryService.setSubGallery(data);
          this.subGallerySource.next(data);
/*           let dataList = data;
          dataList.password = password;
          this.subGallerySourceList.next(dataList); */

          // get price list for gallary
          this.getPriceListById(data.static.sub_gallery_id).subscribe((data:any)=> {
            this.priceList.next(data);
          });
        }
      });
    }

    public getSubGalleryByPassword(password){
      return this.http.get('/data/subgallery/' + password).map((data)=> data);
    }

    //price list
    getPriceListById(idSubGallery){
      return this.http.get('/data/get/price-list/' + idSubGallery).map((data)=> data);
    }


    // public setGallery(value: any) {
    //     this.gallerySource.next(value);
    //     this.gallerySource.complete();
    // }
    //
    // public getGallery(){
    //     return this.gallerySource.getValue();
    // }

    // public getSubGalleryByPassword(password){
    //     return this.http.get('/data/subgallery/' + password).map((data)=> data);
    // }

    // public setSubGallery(value: any) {
    //     this.subGallerySource.next(value);
    //     this.subGallerySource.complete();
    // }
    //
    // public getSubGallery(){
    //     return this.subGallerySource.getValue();
    // }

    //price list
    // getPriceListById(idGallery){
    //     return this.http.get('/data/get/price-list/' + idGallery).map((data)=> data);
    // }

    // public setPriceList(value: any) {
    //     this.priceListSource.next(value);
    //     this.priceListSource.complete();
    // }
    //
    // public getPriceList(){
    //     return this.priceListSource.getValue();
    // }

}
