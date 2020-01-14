import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  img;
  currentUser: UserModel;
  img_bgd = `../../${environment.base}/assets/images/179317.jpg`;
  spinner = true;
  @Input() user: UserModel;

  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.spinner = true;
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => {
          this.user = data;
          this.img = this.user.avatar == '' || this.user.avatar == null? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + this.user.avatarType.toLowerCase() + ';base64, '+ this.user.avatar);
        this.spinner = false;}
      )
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

   formatTel(element) {
    let separator = " ";
    let newvalue = "";
    if(element != undefined){
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
}
