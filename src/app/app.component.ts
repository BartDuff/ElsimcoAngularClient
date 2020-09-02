import { Component } from '@angular/core';
import {UserModel} from './models/user.model';
import {SwPush} from '@angular/service-worker';
import {NotificationService} from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ElsimcoAngularClient';
  currentUser: UserModel;
  readonly VAPID_PUBLIC_KEY = "BJ19TG6FbyDjN1SL27QUm399oqso60BNoSXNsdCEZu7DVhV--meVslq0fy_1bB6qcTKhhc-KHop2L2lLnh9FF8s";

  constructor(
    private swPush: SwPush,
    private notificationService: NotificationService) {}

  subscribeToNotifications() {

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => this.notificationService.addPushSubscriber(sub).subscribe())
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

}
