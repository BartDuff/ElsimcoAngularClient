import {Component, Input, OnInit} from '@angular/core';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {UserService} from '../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {ImageService} from '../services/image.service';

@Component({
  selector: 'app-annuaire',
  templateUrl: './annuaire.component.html',
  styleUrls: ['./annuaire.component.css']
})
export class AnnuaireComponent implements OnInit {
  currentUser: UserModel;
  img_bgd = `../../${environment.base}/assets/images/179317.jpg`;
  spinner;
  users: UserModel[] = [];

  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private imageService: ImageService) {
  }

  ngOnInit() {
    this.spinner = true;
    this.userService.getUsers().subscribe(
      data => {
        for (let user of data) {
          if (user.fonction != 'DEVELOPPEUR') {
            this.users.push(user);
          }
          this.imageService.getImage(user.imageId).subscribe(
            (image) => {
              user.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
        }
        this.spinner = false;
      }
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getUserImage(user) {
    this.imageService.getImage(user.imageId).subscribe(
      (image) => {
        return image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
      }
    );
  }

  formatTel(element) {
    let separator = ' ';
    let newvalue = '';
    if (element != undefined) {
      for (let i = 0; i < element.length; i++) {
        if ((i > 0) && (i % 2 == 0)) {
          newvalue += separator;
        }
        newvalue += element.charAt(i);
      }
      element = newvalue;
    }
    return element;
  }

  formatTelForCall(element) {
    if (element != undefined) {
      element = element.slice(1);
      let phoneCall = element.trim();
      phoneCall = '+33' + phoneCall;
      return phoneCall;
    }
    return element;
  }
}
