import { Component, OnInit, Inject,ViewChild, Renderer2, ElementRef, QueryList, ViewChildren } from '@angular/core';
// import {CartService} from "../cart.service";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { CartService}  from "../cart.service";
import { LocalStorage } from "ngx-store";
import { GalleryService } from "../gallery.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

import { CropperComponent } from 'angular-cropperjs';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})

export class CartPageComponent implements OnInit {

  // @LocalStorage() passwordGallery: any = '';
  @LocalStorage() currentCollapse: number;
  @ViewChild('angularCropper') public angularCropper: CropperComponent;

  /*quantity : FormControl = new FormControl("");*/

  products;
  activeProductsIndex = [];
  productsIdInCart;
  cartTotal;
  userId;
  count;
  //extendedPrice;

  dataImageOriginalPreview;
  dataImageCropFromBack;
  configCrop:any = {
    aspectRatio: 2/3,
    zoomable: false,
    checkOrientation: false,
    cropBoxResizable: false,
    movable: false,
    rotatable: false,
    dragMode: 'none',
    scalable: false,
    ready: this.setSizeCropImg.bind(this)
  };
  stateActiveProductsInCart = [];

  priceList: any;
  resultProducts: any;
  subGallery: any;

  constructor(
      public ngxSmartModalService: NgxSmartModalService,
      private route: ActivatedRoute,
      private renderer: Renderer2,
      private galleryService: GalleryService,
      private cartService: CartService) { }

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    window.scrollTo(0, 0);

    this.galleryService.subGallerySource.subscribe((subGallery)=>{
      this.subGallery = subGallery;
    });

    this.cartService.productsRef.subscribe((products)=>{
      this.products = Object.values(products).slice().reverse();
      if(this.products.length > 0){
        this.stateActiveProductsInCart =[];
        this.products.forEach((product, i) =>{
          this.stateActiveProductsInCart.push(true);
          this.countExtendedPrice(product);

          if(product.products && product.products.length === 1){
            product.products.filter(item => (item.product_type === 'Digital' || item.product_type === 'Digital Full', product.digital = true));
          }
          else{
            product.digital = false;
          }
        });
      }

      this.galleryService.priceList.subscribe((priceList)=>{
        this.priceList = priceList;
        this.getAllPackagesPoses();
      });

      this.productsIdInCart = Object.keys(products).slice().reverse();

      this.getAllPackagesPoses();
    });
    this.cartService.subTotalCart.subscribe((summ)=>{
      this.cartTotal = summ;
    });

  }

  getAllPackagesPoses() {
    if (this.products == undefined || this.priceList == undefined || this.priceList.length == 0 ||
        this.priceList.packages == undefined) return;

    this.resultProducts = this.products.filter((arrProducts)=>{
      this.priceList.packages.some((arrPriceList)=>{
        if (arrProducts.id === arrPriceList.id && arrProducts.name === arrPriceList.name) {
          arrProducts.limit_poses = arrPriceList.limit_poses
        }
      })
    })
  }

  showUndoBtn(product, status) {
    product.showButton = status;
  }

  countExtendedPrice(product){
    product.extendedPrice = product.price * product.quantity;
  }

  updateImg(newImg, product, indexProduct, indexProductInPackage = null, poses = null){
    this.currentCollapse = indexProduct;
    if(product.type == 'package'){
      if(poses === 1){
        product.products = product.products.map(item => {
          //change some data in item
          item.image = newImg.image;
          item.index = newImg.index;
          item.image_id = this.subGallery.data[newImg.index].id;
          item.crop_info = this.cartService.getCropInfoDefault(this.subGallery.data[newImg.index], item.size);
          return item;
        });

        this.stateActiveProductsInCart[indexProduct] = false;
        this.cartService.updateProductImgInfo(this.productsIdInCart[indexProduct], product).subscribe((productUpdate)=>{
          this.updateViewProductInCart(indexProduct, productUpdate);
        });
      }else{
        let allIndexProductInPackage = product.products.map(item => item.index);
        let uniqueProducts = allIndexProductInPackage.filter((value, index, self) => self.indexOf(value) === index);
        let sliceArrayAfterCurIndex = allIndexProductInPackage.slice(allIndexProductInPackage.indexOf(product.products[indexProductInPackage].index)+1);

        if(uniqueProducts.length < poses ||
            uniqueProducts.indexOf(newImg.index) !== -1 ||
            poses === 0 ||
            (uniqueProducts.length == poses && sliceArrayAfterCurIndex.indexOf(product.products[indexProductInPackage].index) == -1)){
          product.products[indexProductInPackage].image = newImg.image;
          product.products[indexProductInPackage].index = newImg.index;
          product.products[indexProductInPackage].image_id = this.subGallery.data[newImg.index].id;
          product.products[indexProductInPackage].crop_info = this.cartService.getCropInfoDefault(this.subGallery.data[newImg.index], product.products[indexProductInPackage].size);

          this.stateActiveProductsInCart[indexProduct] = false;
          this.cartService.updateProductImgInfo(this.productsIdInCart[indexProduct], product).subscribe((productUpdate)=>{
            this.updateViewProductInCart(indexProduct, productUpdate);
          });
          this.showUndoBtn(product, false);
        }else{
          this.showUndoBtn(product, true);
        }
      }
    }else{
      product.image = newImg.image;
      product.index = newImg.index;
      product.image_id = this.subGallery.data[newImg.index].id;
      product.crop_info = this.cartService.getCropInfoDefault(this.subGallery.data[newImg.index], product.size);

      this.stateActiveProductsInCart[indexProduct] = false;
      this.cartService.updateProductImgInfo(this.productsIdInCart[indexProduct], product).subscribe((productUpdate)=>{
        this.updateViewProductInCart(indexProduct, productUpdate);
      });
    }
  }

  /**
   * CROPPING
  */
  showModalCrop(img, product, indexProduct , indexProductInPackage = null){

    this.configCrop.aspectRatio = img.imageSize.width / img.imageSize.height;

    let dataProduct:any = {
      product: product,
      id:this.productsIdInCart[indexProduct],
      indexProductInPackage: indexProductInPackage
    };
    let dataForModal =  Object.assign(img, dataProduct);
    this.ngxSmartModalService.setModalData(dataForModal, 'modalCropImg');

    // console.log(product.products[indexProductInPackage].crop_info);
    if(product.type == 'package'){
      this.dataImageCropFromBack = product.products[indexProductInPackage].crop_info
    }else{
      this.dataImageCropFromBack = product.crop_info;
    }

    this.ngxSmartModalService.getModal('modalCropImg').open();
  }
  setSizeCropImg(data){
    if(this.angularCropper !== undefined){
      this.dataImageOriginalPreview = this.angularCropper.cropper.getImageData();
    }
    let kScaleImgCrop = this.dataImageOriginalPreview.naturalHeight/this.dataImageCropFromBack.height_original;
    this.angularCropper.cropper.setData({
      width: this.dataImageOriginalPreview.naturalWidth,
      height: this.dataImageOriginalPreview.naturalHeight,
      y: this.dataImageCropFromBack.y*kScaleImgCrop
    })
  }
  sendRequestWithUpdateSizeCrop(){
    let data = this.ngxSmartModalService.getModalData('modalCropImg');
    let product = data.product,
        idProduct = data.id,
        indexProductInPackage = data.indexProductInPackage;

    let positionCropImgY = Math.round(this.angularCropper.cropper.getData().y *this.dataImageCropFromBack.height_original/ this.dataImageOriginalPreview.naturalHeight);

    if(product.type == 'package'){
      product.products[indexProductInPackage].crop_info.y = positionCropImgY;
    }else{
      product.crop_info.y = positionCropImgY;
    }
    let indexProductInCart = this.productsIdInCart.indexOf(idProduct);
    this.stateActiveProductsInCart[indexProductInCart] = false;

    this.cartService.updateProductCropInfo(idProduct, product).subscribe((product)=>{
      this.updateViewProductInCart(indexProductInCart, product)
    })
  }
  resetDataModalCrop(){
    if(this.angularCropper !== undefined){
      this.angularCropper.cropper.destroy();
    }
    this.ngxSmartModalService.resetModalData('modalCropImg');
  }
  /**
  * END CROPPING
  */

  updateSize(newSize,  product, indexProduct, indexProductInPackage = null){
    if(product.type == 'package'){
      console.log('update packege ' + indexProductInPackage);
      console.log(product);
      product.products[indexProductInPackage].size = newSize;
      product.products[indexProductInPackage].crop_info = this.cartService.getCropInfoDefault(product.products[indexProductInPackage].size_original, newSize);
    }else{
      product.size = newSize;
      product.crop_info = this.cartService.getCropInfoDefault( product.size_original, newSize);
    }

    this.stateActiveProductsInCart[indexProduct] = false;

    this.cartService.updateProductImgInfo(this.productsIdInCart[indexProduct], product).subscribe((productUpdate) => {
       this.updateViewProductInCart(indexProduct, productUpdate);
    });
  }
  updateViewProductInCart(indexProduct, newProduct){

    this.products[indexProduct] = Object.values(newProduct)[0];
   // console.log(this.products.slice())
    this.stateActiveProductsInCart[indexProduct] = true;
    Object.assign(this.cartService.productsRef.getValue(), newProduct);
    this.getAllPackagesPoses();
  }
  toggleViewCard(e, index){
    const classCollapse = 'collapse';
    const hasClass = e.target.classList;

    let collapseBlk = document.getElementsByClassName('collapse-cnt')[index];

    if(hasClass.contains(classCollapse)) {
      this.renderer.removeClass(e.target, classCollapse);
      this.renderer.removeClass(collapseBlk, classCollapse);
      this.activeProductsIndex[index] = true;
    } else {
      this.renderer.addClass(e.target, classCollapse);
      this.renderer.addClass(collapseBlk, classCollapse);
      this.activeProductsIndex[index] = false;
    }
  }

  /**
   * Update count product and price
   * @param event
   * @param product
   * @param indexProduct
   */
  onCountChange(event, product, indexProduct) {
    product.quantity = event.target.value;
    if(product.quantity === "") return;
    this.cartService.updateProductQuantity(this.productsIdInCart[indexProduct], product).subscribe((updateProduct)=>{
      // this.products[indexProduct] = Object.values(updateProduct)[0];
      this.cartService.getSubTotalCart(this.products);
    });
  }

  /**
   * Update count product and price on click minus/plus button's
   * @param type
   * @param product
   * @param indexProduct
   */
  onCountChangeBtn(type, product, indexProduct) {
    if(type == 'minus' && product.quantity >= 2) {
      product.quantity--;
    }
    else if(type == 'plus' && product.quantity >= 1){
      product.quantity++;
    }
    this.countExtendedPrice(product);

    this.cartService.updateProductQuantity(this.productsIdInCart[indexProduct], product).subscribe((updateProduct)=>{
      this.cartService.getSubTotalCart(this.products);
    });
  }

  onRetouchChange(event, product, indexProduct) {
    product.retouch = event.target.value;
    if(product.retouch === "") return;
    this.cartService.updateProductQuantity(this.productsIdInCart[indexProduct], product).subscribe((updateProduct)=>{
      this.cartService.getSubTotalCart(this.products);
    });
  }

  /**
   * Delete packages/products from cart
   */
  deleteFromCart(e, index){
    let hasAddon = false;
    this.stateActiveProductsInCart[index] = false;
    let confirmDelAddon = true;
    let addonAry = '';
    
    if(this.products[index].type == "package"){
      hasAddon = this.products.some((product, i)=> {
        return product.type != "package" && i !== index && product.sub_gallery_password == this.products[index].sub_gallery_password;
      });
      if(hasAddon){
        if (confirm(`All add-ons will delete if you delete package.`)) {
          for (let x in this.products) {
            if (this.products[x].sub_gallery_password == this.products[index].sub_gallery_password && this.products[x].type != 'package') {
              if (addonAry == '') {
                addonAry = this.productsIdInCart[x];
              } else {
                addonAry += "," + this.productsIdInCart[x];
              }
            }
          }
        } else {
          confirmDelAddon = false;
          this.stateActiveProductsInCart[index] = true;
        }
      }
    }

    console.log(confirmDelAddon, this.productsIdInCart[index]);
    if (confirmDelAddon) {
      if (addonAry == '') {
        addonAry = this.productsIdInCart[index];
      } else {
        addonAry += "," + this.productsIdInCart[index];
      }
      console.log(addonAry);
      this.cartService.removeFromCart(addonAry);
    }
  }
}
