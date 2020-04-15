import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree , CanActivate} from '@angular/router';
import { Observable } from 'rxjs';

import {LocalStorage} from "ngx-store";
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChoosenImgGuard implements CanActivate {
  @LocalStorage() currentImg: any;

  constructor(private router: Router, private route: ActivatedRoute) {}

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
  ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
      if(this.currentImg == undefined ||  this.currentImg !==  ''){
        return true;
      }
      this.router.navigate(['/app/', route.params.id, 'gallery']);
      return false;
  }
}


