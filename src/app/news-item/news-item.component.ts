import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NewsModel} from '../models/news.model';
import {Subscription} from 'rxjs';
import {UserModel} from '../models/user.model';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {MissionModel} from '../models/mission.model';
import {NgxGalleryAnimation, NgxGalleryArrowsComponent, NgxGalleryImage, NgxGalleryImageSize, NgxGalleryOptions} from 'ngx-gallery';
import {ImageService} from '../services/image.service';


@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})

export class NewsItemComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  galleryOptions: NgxGalleryOptions[];
  singleImg;
//  galleryImages: NgxGalleryImage[];
  galleryImages: any[]=[];
  galleryImagesTmp;
  sourceImg;
  isLiked: boolean;
  likes : UserModel[];
  likesForNews:UserModel[];
  typeMatch ={
    'jpeg':'jpeg',
    'JPG':'jpeg',
    'JPEG':'jpeg',
    'jpg':'jpeg',
    'png':'png',
    'PNG':'png'
  };
  @Input() newsitem: NewsModel;
  @Output() newsSelected = new EventEmitter<NewsModel>();
  @Output() newsToDeleteInList = new EventEmitter<NewsModel>();
  @Output() newsToDelete = new EventEmitter<NewsModel>();

  constructor(private newsService: NewsService,
              private userService: UserService,
              private authService: AuthenticationService,
              private sanitizer: DomSanitizer,
              private imageService: ImageService) {
  }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      }
    );
    // this.sourceImg = this.newsitem.imageJointe == '' || this.newsitem.imageJointe == null?'': this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64, '+ this.newsitem.imageJointe);
    this.authService.emitCurrentUserSubject();
    this.newsService.emitNewsSubject();
    this.getLikes();
    this.galleryOptions = [
      {
        width: '100%',
        height: '70vh',
        thumbnailsColumns: 4,
        imageSize: NgxGalleryImageSize.Contain,
        imageAnimation: NgxGalleryAnimation.Slide,
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 10,
        thumbnailMargin: 10,
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '300px',
        imageSize: NgxGalleryImageSize.Contain,
        imageSwipe: true,
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,
        thumbnailsColumns: 4,
      },
      // max-width 400
      {
        breakpoint: 200,
        preview: true,
        width: '100%',
        height: '200px',
        imageSize: NgxGalleryImageSize.Contain,
        imageSwipe: true,
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20.,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      }
    ];

    this.galleryImages = [];
    this.galleryImagesTmp = [];

    // for(let img of this.newsitem.images){
    //   let item =       {
    //     small: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe,
    //     medium: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe,
    //     big: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe
    //   };
    //   this.galleryImages.push(item);
    // }
    //

     if(this.newsitem.imageIds){
       for(let imgid of this.newsitem.imageIds.split(",")){
         this.imageService.getImage(+imgid).subscribe(
           (img)=>{
             this.singleImg = img;
             let item = {
               id:+imgid,
               small: 'data:image/' + this.typeMatch[img.imageJointeType.toString()] + ';base64,'+ img.imageJointe,
               medium: 'data:image/' + this.typeMatch[img.imageJointeType.toString()] + ';base64,'+ img.imageJointe,
               big: 'data:image/' + this.typeMatch[img.imageJointeType.toString()] + ';base64,'+ img.imageJointe
             };

             this.galleryImages.push(item);
             this.galleryImages.sort(
               (a,b)=>{
                 let aa=a.id;
                 let bb=b.id;
                 return aa<bb?1:(aa>bb?-1:0)
               }
             );
           }
         );
       }
     }
  }

  getLikes() {
    this.newsService.getLikesForNews(this.newsitem).subscribe(
      (data)  => {
        this.likes = data;
        this.isLiked = this.likes.find(x => x.id === this.currentUser.id) !== undefined;
      }
    )
  }

  addNewsToList() {
    this.newsSelected.emit(this.newsitem);
    this.isLiked = true;
    this.likes.push(this.currentUser);
    // this.getLikes();
  }

  deleteNewsFromList() {
    this.newsToDeleteInList.emit(this.newsitem);
    this.isLiked = false;
    this.likes.splice(this.likes.indexOf(this.currentUser),1);
    // this.getLikes();
  }

  deleteNews(){
      this.newsToDelete.emit(this.newsitem);
  }

  getPrenoms(list: UserModel[]): String{
    let pList = "";
    if(list != undefined){
      for(let l of list){
        pList += l.prenom + ", ";
      }
      pList = pList.substr(0,pList.length-2);
    }
    return pList;
  }

}
