import { Component, OnInit } from '@angular/core';
import {FaqService} from '../services/faq.service';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {FaqModel} from '../models/faq.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.css']
})
export class FaqListComponent implements OnInit {

  faq: FaqModel[];
  currentUser: UserModel;
  loading = true;
  constructor(private faqService: FaqService,
              private dialog: MatDialog,
              private toastrService: ToastrService) { }

  ngOnInit() {
    this.getFaq();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getFaq() {
    this.faqService.getFaq().subscribe(
      (data) => {
        this.faq = data;
        this.loading=false;
      }
    );
  }

  deleteFaq(faqToDelete) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data)=>{
        if(data) {
          this.faqService.deleteFaq(faqToDelete).subscribe(
            ()=> {
              this.faq.splice(this.faq.indexOf(faqToDelete), 1);
            }
          );
        }
      }
    )
  }

}
