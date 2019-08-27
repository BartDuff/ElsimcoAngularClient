import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {withIdentifier} from 'codelyzer/util/astQuery';
import {from} from 'rxjs';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private userService: UserService) { }

  addForm: FormGroup;
  user: UserModel;

  get f() {
    return this.addForm.value;
  }

  ngOnInit() {

    this.addForm = this.formBuilder.group({
      email: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      role: ['', Validators.required],
      fonction:['', Validators.required]
    });

  }

  onSubmit() {
    this.user = new UserModel();
    this.user.email = this.f.email;
    this.user.prenom = this.f.prenom;
    this.user.nom = this.f.nom;
    this.user.role = this.addForm.get('role').value;
    this.user.fonction = this.addForm.get('fonction').value;
    this.userService.addUser(this.user)
      .subscribe( data => {
        this.router.navigate(['users']);
      });
  }
}
