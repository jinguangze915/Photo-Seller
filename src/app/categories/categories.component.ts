import { Component, OnInit } from '@angular/core';
import {GalleryService} from '../gallery.service';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  gallery: Array<any> = [];

  galleryIdFromRoute;

  constructor(
      private  galleryService: GalleryService,
      private route: ActivatedRoute,
      private router: Router
  ) { }

  ngOnInit() {

    this.galleryIdFromRoute = this.route.snapshot.params['id'];

    this.galleryService.getGalleryById(this.galleryIdFromRoute).subscribe((data:any)=> {
      if (data.status) {
        this.galleryService.gallerySource.next(data);
        this.gallery = data;
      }
    });
  }

  /**
   * Scroll top on click button
    */
  scrollToTop(){
    try
    {
      window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }
}
