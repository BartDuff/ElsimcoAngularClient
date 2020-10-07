import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ImageService} from '../services/image.service';
import {InputFileComponent} from 'ngx-input-file';
import {UserModel} from '../models/user.model';
import {NewsModel} from '../models/news.model';
import {ImageModel} from '../models/image.model';
import {MessageForumModel} from '../models/message-forum.model';
import {MessageForumService} from '../services/message-forum.service';

@Component({
  selector: 'app-message-add',
  templateUrl: './message-add.component.html',
  styleUrls: ['./message-add.component.css']
})
export class MessageAddComponent implements OnInit {
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private messageService: MessageForumService) { }

  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  addForm: FormGroup;
  currentUser: UserModel;
  message: MessageForumModel;
  loading = false;
  selected;
  categories = ["Besoins Elsimco", "Transfert d'expérience", "Afterworks"];
  catShort = ['Besoins', 'Experiences', 'Afterworks']



  get f() {
    return this.addForm.value;
  }

  ngOnInit() {
    this.message = new MessageForumModel();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.addForm = this.formBuilder.group({
      id: [],
      sujet: ['', Validators.required],
      message: ['', Validators.required],
      categorie: ['', Validators.required]
    });
    this.selected = this.currentUser.role == "ADMIN"?"Besoins":"Afterworks";
    this.addForm.controls.categorie.setValue(this.selected)
  }

  onSubmit() {
    this.loading = true;
    let message: MessageForumModel = this.f;
    message.auteur = this.currentUser;
    message.type = "origin";
    this.messageService.addMessage(message)
      .subscribe( (data) => {
        message.originId = data.id;
          this.messageService.editMessage(message).subscribe(
            ()=>{
              this.loading = false;
              this.router.navigate(['forum']);
            }
          )
        },
        (error)=>console.log(error))
  }

  s(s){
    JSON.stringify(s)
  }


}
