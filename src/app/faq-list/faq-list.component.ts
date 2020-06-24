import { Component, OnInit } from '@angular/core';
import {FaqService} from '../services/faq.service';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {FaqModel} from '../models/faq.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {ToastrService} from 'ngx-toastr';
import {DragulaService} from 'ng2-dragula';

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.css']
})
export class FaqListComponent implements OnInit {
  test;
  faqRH: FaqModel[] = [];
  faqCommercial: FaqModel[] = [];
  faqFinance: FaqModel[] = [];
  faq: FaqModel[] = [];
  categories = ["COMMERCIAL","RH","FINANCES"];
  currentUser: UserModel;
  loading = true;
  constructor(private faqService: FaqService,
              private dialog: MatDialog,
              private toastrService: ToastrService,
              private dragula: DragulaService) { }

  ngOnInit() {
    this.getFaq();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getFaq() {
    this.faqService.getFaq().subscribe(
      (data) => {
        for(let d of data){
          if(d.category == "FINANCES"){
            this.faqFinance.push(d);
          }
          if(d.category == "RH"){
            this.faqRH.push(d);
          }
          if(d.category == "COMMERCIAL"){
            this.faqCommercial.push(d);
          } else {
            this.faq.push(d);
          }
        }
        this.faqCommercial.sort((a,b)=>a.chosenOrder-b.chosenOrder);
        this.faqRH.sort((a,b)=>a.chosenOrder-b.chosenOrder);
        this.faqFinance.sort((a,b)=>a.chosenOrder-b.chosenOrder);
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

  changeOrder(array){
    for(let el of array){
      el.chosenOrder = array.indexOf(el)+1
      this.faqService.editFaq(el).subscribe(
        ()=>{}
      );
    }
  }

}
