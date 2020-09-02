import { Component, OnInit } from '@angular/core';
import {RxStomp} from '@stomp/rx-stomp';
import {map} from 'rxjs/operators';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-notifications-rx',
  templateUrl: './notifications-rx.component.html',
  styleUrls: ['./notifications-rx.component.css']
})
export class NotificationsRxComponent {

  private key = {
    "publicKey":"BJ19TG6FbyDjN1SL27QUm399oqso60BNoSXNsdCEZu7DVhV--meVslq0fy_1bB6qcTKhhc-KHop2L2lLnh9FF8s",
    "privateKey":"KBc8wdrGjWanDBk3yVimmfKfRa7U5caJxklnSfh3beE"
  }


  private client: RxStomp;
  public notifications: string[] = [];
  connectClicked() {
    if (!this.client || this.client.connected) {
      this.client = new RxStomp();
      this.client.configure({
        webSocketFactory: () => new SockJS('http://localhost:9092/notifications'),
        debug: (msg: string) => console.log(msg)
      });
      this.client.activate();
      this.watchForNotifications();
      console.info('connected!');
    }
  }
  private watchForNotifications() {
    this.client.watch('/user/notification/item')
      .pipe(
        map((response) => {
          const text: string = JSON.parse(response.body).text;
          console.log('Got ' + text);
          return text;
        }))
      .subscribe((notification: string) => this.notifications.push(notification));
  }
  disconnectClicked() {
    if (this.client && this.client.connected) {
      this.client.deactivate();
      this.client = null;
      console.info("disconnected :-/");
    }
  }
  startClicked() {
    if (this.client && this.client.connected) {
      this.client.publish({destination: '/start'});
    }
  }
  stopClicked() {
    if (this.client && this.client.connected) {
      this.client.publish({destination: '/stop'});
    }
  }

}
