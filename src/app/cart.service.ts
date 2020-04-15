import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})

export class CartService {
  productsRef = new BehaviorSubject<any>({});
  // productCrop = new BehaviorSubject<any>({});
  subTotalCart = new BehaviorSubject<any>({});
  // subTotal = new BehaviorSubject<any>(Number);
  //
  // products : any = {};

  emailCookie = new BehaviorSubject<any>({});

  productType = new BehaviorSubject<any>('');

  constructor(private http: HttpClient) {
  }

  //recode
  recode(code) {
    return this.http.get('/recode/'+code).map((data) => data);
  }

  //cart
  addToCart(product){
    return this.http.post('/cart/add', product).map((data)=> data);
  }
  resetCart(){
    return this.http.get('/cart/clear').map((data)=>data);
  }

  getAllProducts(){
    return this.http.get('/cart/get').map((data)=>data);
  }

  updateProductCropInfo(id, product){
    return this.http.post('/cart/update-crop-info/' + id, product).map((product:any)=> product);
  }
  updateProductImgInfo(id, product){
    return this.http.post('/cart/update-image-info/' + id, product).map((product:any)=> product);
  }
  updateProductQuantity(id, product){
    return this.http.post('/cart/update-quantity/' + id, product).map((product:any)=> product);
  }

  removeFromCart(id){
    const promise = this.http.get('/cart/remove/' + id).toPromise();
    promise.then((data) => {
      this.productsRef.next(data);
    }).catch((error) => {
      console.log("Promise rejected with " + JSON.stringify(error));
    });
    // const promise = this.http.get('/cart/remove/' + id).subscribe((data)=> {
    //  this.productsRef.next(data);
    // });
  }

  //order
  createOrder(obj) {
    return this.http.post('order/create', obj).map((data:any )=> {
      if (data) {}
      return data;
    });
  }

  //send email
  sendPromoCode(obj) {
    return this.http.post('order/promocode', obj).map((data:any )=> {
      if (data) {}
      return data;
    });
  }

  sendEmail(obj) {
    return this.http.post('customer/create', obj).map((data:any )=> {
      return data;
    });
  }

  //watch email and cart data
  watchSendEmail(){
    this.emailCookie.subscribe((val)=>{
      this.emailCookie.next(val);
    });
  }

  watchProductType(){
    this.productType.subscribe((val)=>{
      this.productType.next(val);
    });
  }

  watchSubTotalCart(){
    this.productsRef.subscribe((productsObj)=>{
      console.log('called watch sub total cart -test--', productsObj);
      let products: Array<any> = Object.values(productsObj);
      this.getSubTotalCart(products);
    });
  }
  getSubTotalCart(products){
    if(products.length){
      let subtotal = products.map(product => Number((product.quantity * product.price).toFixed(2)))
          .reduce((prev, next) => Number((prev + next).toFixed(2)));
      this.subTotalCart.next( subtotal );
    } else{
      this.subTotalCart.next(0);
    }
  }

  getCropInfoDefault(originSize, selectSize){
    if(!selectSize) return;
    let heightCrop = Math.round(originSize.width * selectSize.height /  selectSize.width);
    let topY = Math.round((originSize.height - heightCrop) / 2);
    return {
      height: heightCrop,
      height_original: originSize.height,
      width: originSize.width,
      x: 0,
      y: topY
    }
  }

  /*GIFT*/
  getInfoGift(){
    return this.http.get('cart/get-free-gift-info').map((data:any )=> {
      return data;
    });
  }
  updateInfoGift(info){
    return this.http.post('cart/update-free-gift-info', info).map((data:any )=> {
      return data;
    });
  }
}
