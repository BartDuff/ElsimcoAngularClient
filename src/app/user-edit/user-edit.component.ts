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
      role: ['', Validators.required],
      fonction: ['', Validators.required],
      trigramme:['', Validators.required],
      cpNMoins1:['', Validators.required],
      cpN:['', Validators.required],
      rttn:['', Validators.required],
      congeAnciennete:[''],
      adressePostale:['', Validators.required],
      telephone:['', [Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
      emailPerso:['', [Validators.email, Validators.required]],
      dateArrivee:['', Validators.required],
      metier:['', Validators.required]
    });
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => {
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.email.setValue(data.email);
          this.editForm.controls.prenom.setValue(data.prenom);
          this.editForm.controls.nom.setValue(data.nom);
          this.editForm.controls.adressePostale.setValue(data.adressePostale);
          this.editForm.controls.telephone.setValue(data.telephone);
          this.editForm.controls.emailPerso.setValue(data.emailPerso);
          this.editForm.controls.dateArrivee.setValue(data.dateArrivee);
          this.editForm.controls.metier.setValue(data.metier);
          this.editForm.controls.role.setValue(data.role);
          this.editForm.controls.fonction.setValue(data.fonction);
          this.editForm.controls.cpNMoins1.setValue(data.cpNMoins1);
          this.editForm.controls.cpN.setValue(data.cpN);
          this.editForm.controls.rttn.setValue(data.rttn);
          this.editForm.controls.rttn.setValue(data.congeAnciennete);
        }
      )
    );

  }

  onSubmit() {
    if (this.editForm.get('role').value == '') {
      this.editForm.get('role').setValue(this.user.role);
    }
    if (this.editForm.get('fonction').value == '') {
      this.editForm.get('fonction').setValue(this.user.fonction);
    }
    this.userService.editUser(this.editForm.value)
      .subscribe(data => {
        this.router.navigate(['users']);
      });
  }
}
