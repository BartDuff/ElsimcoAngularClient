import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private userService: UserService) {
  }
  editForm: FormGroup;
  currentUser: UserModel;
  user: UserModel;

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      email: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      role: ['', Validators.required]
    });
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => {
          this.editForm.setValue(data);
        }
      )
    );

  }

  onSubmit() {
    if (this.editForm.get('role').value == '') {
      this.editForm.get('role').setValue(this.user.role);
    }
    this.userService.editUser(this.editForm.value)
      .subscribe(data => {
        this.router.navigate(['users']);
      });
  }
}
