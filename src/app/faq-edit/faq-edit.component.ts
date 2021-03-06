import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {FaqService} from '../services/faq.service';
import {UserModel} from '../models/user.model';
import {NewsModel} from '../models/news.model';
import {FaqModel} from '../models/faq.model';
import {ConfigurationService} from '../services/configuration.service';

@Component({
  selector: 'app-faq-edit',
  templateUrl: './faq-edit.component.html',
  styleUrls: ['./faq-edit.component.css']
})
export class FaqEditComponent implements OnInit {
  editForm: FormGroup;
  currentUser: UserModel;
  faqitem: FaqModel;
  loading = false;
  // mailAdresses = ["majoline.domingos@elsimco.com","ghislain.chatras@elsimco.com","franck.simon@elsimco.com"];
  mailAdresses;
  categories = ["COMMERCIAL","RH","FINANCES"];


  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private faqService: FaqService,
              private configurationService: ConfigurationService) { }

  ngOnInit() {
    this.loading = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      question: ['', Validators.required],
      reponse: ['', Validators.required],
      mailContact: ['', Validators.required],
      category: ['', Validators.required]
    });
    this.configurationService.getSingleConfiguration('1').subscribe(
      (config)=>{
        this.mailAdresses = config.contactsFaq;
      }
    );
    this.route.params.subscribe(
      params => this.faqService.getSingleFaq(params['id']).subscribe(
        data => {
          this.faqitem = data;
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.question.setValue(data.question);
          this.editForm.controls.reponse.setValue(data.reponse);
          this.editForm.controls.mailContact.setValue(data.mailContact);
          this.editForm.controls.category.setValue(data.category);
          this.loading = false;
        }
      )
    );
  }

  onSubmit() {
    this.loading = true;
    this.faqService.editFaq(this.faqitem)
      .subscribe( data => {
        this.loading = false;
        this.router.navigate(['faq']);
      });
  }

}
