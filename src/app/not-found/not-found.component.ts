import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {interval} from 'rxjs';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  seconds = 5;
  constructor(private route: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.autoRedirect();
    }, 5000);
    interval(1000).subscribe(() => {
      this.seconds -= 1;
    });
  }

  autoRedirect() {
    this.route.navigate(['']);
  }
}
