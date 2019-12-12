import {Component, OnInit} from '@angular/core';
import {CongeModel} from '../models/conge.model';
import {CongeService} from '../services/conge.service';
import {FicheModel} from '../models/fiche.model';
import { saveAs } from 'file-saver';
import {ToastrService} from 'ngx-toastr';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import * as moment from 'moment';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {EmailService} from '../services/email.service';
import {CandidatModel} from '../models/candidat.model';
import {DocumentModel} from '../models/document.model';

@Component({
  selector: 'app-validation-conges',
  templateUrl: './validation-conges.component.html',
  styleUrls: ['./validation-conges.component.css']
})
export class ValidationCongesComponent implements OnInit {
  congesValides: CongeModel[];
  congesNonValides: CongeModel[];
  congesWithFile: CongeModel[];
  monthArr = [];
  loading = true;
  monthLoading = false;
  daysOffSavedObjArr;
  dateNow: Date;
  dateNowFile;
  users: UserModel[] = [];
  selectedUser;
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  joursDeLaSemaine = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  usersId = [];
  usersToSend = [];

  constructor(private congeService: CongeService,
              private userService: UserService,
              private toastrService: ToastrService,
              private emailService: EmailService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getNonValidatedConges();
    this.getValidatedConges();
    this.getCongesWithFile();
    this.getUsers();
    this.dateNow = new Date();
    this.dateNowFile = new Date();
    this.selectedUser = null;
  }

  updateModel(conge: CongeModel) {
    this.congeService.editConge(conge).subscribe(
      (data) => {

      }
    );
  }


  downloadDocument(conge){
        if (conge.documentJointUri) {
          let blob = this.base64ToBlob(conge.documentJointUri, 'text/plain');
          saveAs(blob, 'justif_'+conge.user.prenom + '_'+ conge.user.nom + "."+conge.documentJointType);
        }
  }

  public base64ToBlob(b64Data, contentType='', sliceSize=512) {
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
  }

  getCongesWithFile() {
    this.congesWithFile = [];
    this.congeService.getConges().subscribe(
        (data) => {
          for (let c of data) {
            if (c.documentJointUri != null && c.documentJointUri !='' && new Date(c.date).getFullYear() == this.dateNowFile.getFullYear()) {
              this.congesWithFile.push(c);
            }
          }
        }
      );
  }

  getNonValidatedConges() {
    this.congesNonValides = [];
    this.monthLoading = true;
    if (this.selectedUser == null) {
      this.congeService.getConges().subscribe(
        (data) => {
          for (let c of data) {
            if(!c.valideRH && this.monthArr.indexOf(this.nomsDesMois[new Date(c.date).getMonth()]+ ' '+ new Date(c.date).getFullYear()) == -1){
              this.monthArr.push(this.nomsDesMois[new Date(c.date).getMonth()] + ' '+ new Date(c.date).getFullYear());
            }
            if (!c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth() && this.congesNonValides.indexOf(c) == -1) {
              this.congesNonValides.push(c);
            }
          }
          this.loading = false;
          this.monthLoading = false;
        }
      );
    } else {
      this.userService.getCongeForUser(this.selectedUser).subscribe(
        (d) => {
          for (let c of d) {
            if (!c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth() && this.congesNonValides.indexOf(c) == -1) {
              this.congesNonValides.push(c);
            }
          }
          this.loading = false;
          this.monthLoading = false;

        });
    }
  }

  getValidatedConges() {
    this.congesValides = [];
    if (this.selectedUser == null) {
      this.congeService.getConges().subscribe(
        (data) => {
          for (let c of data) {
            if (c.valideRH && new Date(c.date).getMonth() === this.dateNow.getMonth()) {
              this.congesValides.push(c);
            }
          }
        }
      );
    } else {
      this.userService.getCongeForUser(this.selectedUser).subscribe(
        (d) => {
          for (let c of d) {
            if (c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth()) {
              this.congesValides.push(c);
            }
          }
        });
    }
  }

  validateCongeRH(conge: CongeModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    let user = null;
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          conge.valideRH = true;
          this.congeService.editConge(conge).subscribe(
            (data) => {
              this.congesNonValides.splice(this.congesNonValides.indexOf(conge), 1);
              user = conge.user;
              this.congesValides.push(conge);
              let sUserCong = '';
              let dem = conge.demiJournee ? '1/2 ' : '';
              let sLine = new Date(conge.date).toLocaleDateString() + ' : ' + dem + conge.typeConge + '\n';
              sUserCong += sLine;
              this.emailService.sendMail('Votre demande pour les dates de congés suivantes a été validée par les Ressources Humaines:\n' + sUserCong, 'Notification de validation de congés', user.email).subscribe(
                () => {
                  this.toastrService.success('Congés validés', 'Congés validés');
                  this.getCongesWithFile();
                  this.getValidatedConges();
                },
                (err) => console.log(err)
              );
            }
          );
        }
      });
  }

  // async promiseRequest(c) {
  //   await this.congeService.editConge(c).toPromise();
  // }

  validateAllCongeRH() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          let arr = this.congesNonValides;
          console.log(arr);
          for (let c of this.congesNonValides) {
            c.valideRH = true;
            if (this.usersId.indexOf(c.user.id) == -1) {
              this.usersId.push(c.user.id);
              this.usersToSend.push(c.user);
            }
            // this.congesNonValides.splice(this.congesNonValides.indexOf(c), 1);
            // this.congesValides.push(c);
          }
          this.congeService.editMultipleConge(this.congesNonValides).subscribe(
            ()=>{
              this.sendValidationEmail(this.congesNonValides);
              this.toastrService.success('Congés validés', 'Congés validés');
            }
          );
        }
      });
  }

  sendValidationEmail(arr) {
    for (let u of this.usersToSend) {
      let userCong = [];
      for (let c of arr) {
        if (c.user.id == u.id) {
          userCong.push(c);
        }
      }
      let sUserCong = '';
      for (let ob of userCong) {
        let dem = ob.demiJournee ? '1/2 ' : '';
        let sLine = new Date(ob.date).toLocaleDateString() + ' : ' + dem + ob.typeConge + '\n';
        sUserCong += sLine;
      }
      this.emailService.sendMail('Votre demande pour les dates de congés suivantes a été validée par les Ressources Humaines:\n' + sUserCong, 'Notification de validation de congés', u.email).subscribe(
        () => {
          this.congesNonValides = [];
          this.getValidatedConges();
        },
        (err) => console.log(err)
      );
    }
    this.usersToSend = [];
    this.usersId = [];
  }

  sendRejectionEmail(arr) {
    for (let u of this.usersToSend) {
      let userCong = [];
      for (let c of arr) {
        if (c.user.id == u.id) {
          userCong.push(c);
        }
      }
      let sUserCong = '';
      for (let ob of userCong) {
        let dem = ob.demiJournee ? '1/2 ' : '';
        let sLine = new Date(ob.date).toLocaleDateString() + ' : ' + dem + ob.typeConge + '\n';
        sUserCong += sLine;
      }
      this.emailService.sendMail('Votre demande pour les dates de congés suivantes a été refusée par les Ressources Humaines:\n' + sUserCong, 'Notification de refus de congés', u.email).subscribe(
        () => {
          this.congesNonValides = [];
          this.getValidatedConges();
        },
        (err) => console.log(err)
      );
    }
    this.usersToSend = [];
    this.usersId = [];
  }

  refuseCongeRH(conge: CongeModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          conge.valideRH = false;
          this.congeService.deleteConge(conge).subscribe(
            (data) => {
              this.congesNonValides.splice(this.congesNonValides.indexOf(conge), 1);
              let sUserCong = '';
              let dem = conge.demiJournee ? '1/2 ' : '';
              let sLine = new Date(conge.date).toLocaleDateString() + ' : ' + dem + conge.typeConge + '\n';
              sUserCong += sLine;
              this.emailService.sendMail('Votre demande pour les dates de congés suivantes a été refusée par les Ressources Humaines:\n' + sUserCong, 'Notification de refus de congés', conge.user.email).subscribe(
                () => {
                  this.toastrService.error('Congé refusé', 'Congé refusé');
                  this.getCongesWithFile();
                  this.getValidatedConges();
                },
                (err) => console.log(err)
              );
            }
          );
        }
      });
  }

  refuseAllCongeRH() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          let arr = this.congesNonValides;
          for (let c of arr) {
            c.valideRH = false;
            if (this.usersId.indexOf(c.user.id) == -1) {
              this.usersId.push(c.user.id);
              this.usersToSend.push(c.user);
            }
          }
          this.congeService.deleteMultipleConge(this.congesNonValides).subscribe(
            () => {
              this.sendRejectionEmail(arr);
              this.toastrService.error('Congés refusés', 'Congés refusés');
            },
            (err) => console.log(err)
          );
        }
      });
  }


  getDaysInMonth(month, year) {
    let date = new Date(Date.UTC(year, month, 1));
    let days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => this.users = data
    );
  }

  getHolidays(user: UserModel) {
    this.userService.getCongeForUser(user).subscribe(
      (data) => {
        for (let d of data) {
          //this.mesConges.push(moment(d.date).format('DD/MM/YYYY').toString());
          this.daysOffSavedObjArr.push(({
            date: moment(d.date).format('DD/MM/YYYY').toString(),
            typeConge: d.typeConge,
            demiJournee: d.demiJournee,
            typeDemiJournee: d.typeDemiJournee,
            valideRH: d.valideRH
          }));
        }
      }
    );
  }

  checkAskedMorningHolidays(day, user: UserModel) {
    for (let x of this.congesValides) {
      if (new Date(x.date).toDateString() == day.toDateString() && x.user.id == user.id) {
        if (x.demiJournee && x.typeDemiJournee == 'Matin' || !x.demiJournee) {
          return true;
        }
      }
    }
    return false;
  }

  checkAskedAfternoonHolidays(day, user: UserModel) {
    for (let x of this.congesValides) {
      if (new Date(x.date).toDateString() == day.toDateString() && x.user.id == user.id) {
        if (x.demiJournee && x.typeDemiJournee == 'Après-midi' || !x.demiJournee) {
          return true;
        }
      }
    }
    return false;
  }

}

