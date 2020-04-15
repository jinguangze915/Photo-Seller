import { Component, OnInit, Input } from '@angular/core';
import {CartService} from "../cart.service";
import { ActivatedRoute } from '@angular/router';
import {GalleryService} from "../gallery.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  cartTotal: number = 0;
  id;

  constructor(private cartService : CartService,
              private galleryService: GalleryService,
              private route: ActivatedRoute,) { }

  ngOnInit() {
    this.cartService.subTotalCart.subscribe((summ)=>{
      this.cartTotal = summ;
    });
    this.galleryService.subGalleryPass.subscribe((pass)=>{
      this.id = pass;
    })
  }
}
