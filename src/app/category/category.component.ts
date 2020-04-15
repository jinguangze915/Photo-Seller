import { Component, OnInit, ElementRef, Injectable, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LocalStorage } from "ngx-store";
import { GalleryService } from '../gallery.service';
import 'hammerjs';
import {Gallery, GalleryItem, ImageItem, ThumbnailsPosition, ImageSize, GalleryConfig} from '@ngx-gallery/core';
import {Lightbox} from "@ngx-gallery/lightbox";

import {Router, ActivatedRoute} from "@angular/router";
import {CartService} from "../cart.service";
import { NgxSmartModalService } from 'ngx-smart-modal';

import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
@Injectable({
  providedIn: 'root'
})

export class CategoryComponent implements OnInit {
  progress: number = 0;
  @LocalStorage() currentImg: any = '';
  @LocalStorage() cartData: any = {};

  gallery: any;
  subgallery: any;
  galleryItems;
  items: GalleryItem[];
  id;
  idSubGallery;

  galleryId = 'myLightbox';

  config: GalleryConfig = {
    loadingMode: "indeterminate"
  };

  error = '';
  formEmail: FormGroup;
  submittedEmail = false;
  formData: any;
  invalidEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

  addLoader:boolean;

  constructor(
    public lightbox: Lightbox,
    public galleryPlugin: Gallery,
    public ngxSmartModalService: NgxSmartModalService,
    private galleryService: GalleryService,
    private cartService: CartService,
    private elem: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  private status = false;

  ngOnInit() {

    this.idSubGallery = this.route.snapshot.params['id'];

  //  console.log('exist subgallerypass: ',this.galleryService.subGalleryPass.getValue());

    if(this.galleryService.subGalleryPass.getValue() != this.idSubGallery){
      this.galleryService.subGalleryPass.next(this.idSubGallery);
    }

    this.galleryService.subGallerySource.subscribe((subGallery) =>{

      this.subgallery = subGallery;
      if(subGallery.data){
        this.galleryItems = subGallery.data;

        this.items = this.galleryItems.map(item =>
          new ImageItem({
            src: item.image + '?_gallery',
            thumb: item.image
          })
        );
        this.galleryPlugin.ref(this.galleryId).load(this.items);
        this.cartData = {
          id: this.subgallery.static.sub_gallery_id
        }
      }
    });

    const lightboxRef = this.galleryPlugin.ref('lightbox');

    //reset cart
    // let clearCart  = Object.values(this.cartService.productsRef.getValue()).some((itemCart:any) => itemCart.sub_gallery_password !== String(this.idSubGallery));
    // if(clearCart){
    //   this.cartService.resetCart().subscribe((products)=>{
    //     this.cartService.productsRef.next(products);
    //   });
    //   return;
    // }

    this.formEmail = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email])
    });
    let sessionEmail = this.getCookie('emailObj');
    if(sessionEmail){
      this.cartService.emailCookie.next(sessionEmail);
      let curObj = JSON.parse(sessionEmail)
      if(curObj.password != this.idSubGallery){
        setTimeout(() => {
          this.openModalEmail()
        }, 200)
      }
    }else{
      if(Object.entries(this.cartService.emailCookie.getValue()).length === 0 && this.cartService.emailCookie.getValue().constructor === Object){
        setTimeout(() => {
          this.openModalEmail()
        }, 200)

      }
    }
  }

  openModalEmail(){
    this.ngxSmartModalService.resetModalData('modalEmail');
    this.ngxSmartModalService.setModalData('', 'modalEmail');
    this.ngxSmartModalService.getModal('modalEmail').open();
    this.ngxSmartModalService.getModal('modalEmail').dismissable = false;
  }

  getImg(img, index, widthOrl, heightOrl, id){
    this.currentImg = {
      image: img,
      index: index,
      sizeOriginal: {
        width: widthOrl,
        height: heightOrl
      },
      imageId: id
    };
  }

  addBtnCart(img, event){
    setTimeout(() => {
      let elementsWrap = this.document.querySelector('gallery-slider');
      let elements = elementsWrap.getElementsByTagName('gallery-item');

      for (let i = 0; i < elements.length; i++) {
        let blk = elements[i];
        let blkBtn = this.renderer.createElement('div');
        this.renderer.addClass(blkBtn, 'gallery-img-btn');
        for (let i = 0; i < this.galleryItems.length; i++) {}
        this.renderer.setProperty(blkBtn, 'innerHTML', `<a [routerLink]="" 
                                                        data-index="${i}" 
                                                        data-id="${this.galleryItems[i].id}"
                                                        data-width="${this.galleryItems[i].width}"
                                                        data-height="${this.galleryItems[i].height}"
                                                        data-img="${this.galleryItems[i].image}" class='gallery-img-lnk'>Choose</a>`);
        this.renderer.appendChild(blk, blkBtn);

        this.renderer.listen(blkBtn, 'click', (event) => {
          event.preventDefault();
          let curPreview;
          let index;
          let widthOrl;
          let heightOrl;
          let idImage;

          if(event.target.className == 'gallery-img-lnk'){
            curPreview = event.target.getAttribute('data-img');
            index = Number(event.target.getAttribute('data-index'));
            idImage = Number(event.target.getAttribute('data-id'));
            widthOrl = Number(event.target.getAttribute('data-width'));
            heightOrl = Number(event.target.getAttribute('data-height'));
          }else{
            curPreview = event.target.parentNode.getAttribute('data-img');
            index = Number(event.target.parentNode.getAttribute('data-index'));
            idImage = Number(event.target.parentNode.getAttribute('data-id'));
            widthOrl =  Number(event.target.parentNode.getAttribute('data-width'));
            heightOrl =  Number(event.target.parentNode.getAttribute('data-height'));
          }
          this.getImg(curPreview, index, widthOrl, heightOrl, idImage);

          this.lightbox.close();
          this.router.navigate(['/app/' + this.idSubGallery + '/packages']);
        });
      }
    }, 200);
  }


  setCookie(name,value,days, path) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=" + path;
  }

  getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
      let c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  get ifEmailErrors() { return this.formEmail.controls; }
  onSubmitEmail() {
    this.submittedEmail = true;
    /**
     * if form invalid then don't send
     */
    if (this.formEmail.invalid) {
      return;
    }

    this.formData = this.formEmail.value;
    this.formData.email = this.formEmail.value.email;
    this.formData.subgallery_id = this.cartData.id;
    this.addLoader = true;

    this.cartService.sendEmail(this.formData).subscribe((data: any) => {
      if (data.status) {
        this.ngxSmartModalService.getModal('modalEmail').close();
        let emailCur = this.formData.email;
        let val = {
          'email': emailCur,
          'password': this.idSubGallery
        };
        this.cartService.emailCookie.next(val);
        this.setCookie('emailObj', JSON.stringify(val), 1, this.router.url)

      } else {
        this.error = 'Sorry, that coupon code is invalid.';
        window.setTimeout(() => {
          this.error = ''
        }, 4000)
      }
      this.addLoader = false;
    })
  }

}
