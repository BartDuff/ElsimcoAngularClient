import { Component, OnInit } from '@angular/core';
import {CongeModel} from '../models/conge.model';
import {UserService} from '../services/user.service';
import {FicheService} from '../services/fiche.service';
import {PdfService} from '../services/pdf.service';
import {ToastrService} from 'ngx-toastr';
import {CongeService} from '../services/conge.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-conge-list',
  templateUrl: './conge-list.component.html',
  styleUrls: ['./conge-list.component.css']
})
export class CongeListComponent implements OnInit {
  currentUser:UserModel;
  conges : CongeModel[] = [];
  constructor(private userService: UserService,
              private congeService: CongeService,
              private toastrService:ToastrService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getCongesForUser();
  }

  getCongesForUser() {
    this.userService.getCongeForUser(this.currentUser).subscribe(
      (data) => {this.conges = data;}
    );
  }

  getNonValidatedConges(){
    let congesAttente = [];
    for(let c of this.conges)
      if(!c.valideRH)
        congesAttente.push(c)
    return congesAttente;
  }

  getValidatedConges(){
    let congesValide = [];
    for(let c of this.conges)
      if(c.valideRH)
        congesValide.push(c)
    return congesValide;
  }

}
