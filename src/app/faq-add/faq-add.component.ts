import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserModel} from '../models/user.model';
import {NewsModel} from '../models/news.model';
import {FaqModel} from '../models/faq.model';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {FaqService} from '../services/faq.service';
import {ConfigurationService} from '../services/configuration.service';

@Component({
  selector: 'app-faq-add',
  templateUrl: './faq-add.component.html',
  styleUrls: ['./faq-add.component.css']
})
export class FaqAddComponent implements OnInit {
  addForm: FormGroup;
  currentUser: UserModel;
  faqitem: FaqModel;
  loading = false;
  // mailAdresses = ["majoline.domingos@elsimco.com","ghislain.chatras@elsimco.com","franck.simon@elsimco.com"];
  mailAdresses;
  categories = ["COMMERCIAL","RH","FINANCES"];


  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private faqService: FaqService,
              private  configurationService: ConfigurationService) { }

  get f() {
    return this.addForm.value;
  }

  ngOnInit() {
    this.faqitem = new FaqModel();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.configurationService.getSingleConfiguration('1').subscribe(
      (config)=>{
        this.mailAdresses = config.contactsFaq;
      }
    );
    this.addForm = this.formBuilder.group({
      id: [],
      question: ['', Validators.required],
      reponse: ['', Validators.required],
      mailContact: ['', Validators.required],
      category: ['', Validators.required]
    });

  }

  onSubmit() {
    this.loading = true;
    let faqitem:FaqModel = this.f;
    this.faqService.addFaq(faqitem)
      .subscribe( () => {
        this.loading = false;
        this.router.navigate(['faq']);
      });
  }

}
