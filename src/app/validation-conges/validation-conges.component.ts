import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  @ViewChild('planning') pRef: ElementRef;
  congesValides: CongeModel[];
  congesNonValides: CongeModel[];
  congesWithFile: CongeModel[];
  allNonValidatedConges : CongeModel[];
  monthArr = [];
  loading = true;
  lastCall1 = true;
  lastCall2 = true;
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
              private dialog: MatDialog,
              private changeDetectorRefs: ChangeDetectorRef) {
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

  changeLastCall(lc){
    lc = false;
  }


  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }

  async splitArrayInRanges(arr) {
    let newArr = [];
    let plage = [];
    arr.sort((a, b) => this.toDate(a.date).valueOf() - this.toDate(b.date).valueOf());
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) {
        if (this.isFollowingDay(arr[i - 1].date, arr[i].date) && arr[i - 1].typeConge == arr[i].typeConge) {
          plage.push(arr[i]);
          if (i == arr.length - 1 || !(this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge)) {
            newArr.push(plage);
            plage = [];
          }
        } else {
          if (i != arr.length - 1) {
            if (this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge) {
              plage.push(arr[i]);
            } else {
              newArr.push(arr[i]);
            }
          } else {
            newArr.push(arr[i]);
          }
        }
      } else {
        if(arr.length>1){
          if (this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge) {
            plage.push(arr[i]);
          } else {
            newArr.push(arr[i]);
          }
        } else {
          newArr.push(arr[i]);
        }
      }
    }
    return newArr;
  }

  isFollowingDay(date1:Date,date2:Date){
    let d1 = this.toDate(date1);
    let d2 = this.toDate(date2);
    let d3 = new Date(d2);
    d3.setDate(d2.getDate() - 1);
    let year = d3.getFullYear();
    let i = 1;
    while(this.checkWeekendsWithYear(d3,year)){
      d3.setDate(d3.getDate() - 1);
      year = d3.getFullYear();
      i++;
    }
    return d2.getDate() == d1.getDate() + i;
  }

  toDate(s) {
    return new Date(s.substr(6, 4), s.substr(3, 2) - 1, s.substr(0, 2));
  }

  checkWeekendsWithYear(day: Date, year) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || ValidationCongesComponent.joursFeries(year).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  isArray(a) {
    return Array.isArray(a);
  }

  static joursFeries(an): String[] {
    const JourAn = new Date(an, 0, 1);
    const FeteTravail = new Date(an, 4, 1);
    const Victoire1945 = new Date(an, 4, 8);
    const FeteNationale = new Date(an, 6, 14);
    const Assomption = new Date(an, 7, 15);
    const Toussaint = new Date(an, 10, 1);
    const Armistice = new Date(an, 10, 11);
    const Noel = new Date(an, 11, 25);
    // const SaintEtienne = new Date(an, '11', '26');
    const G = an % 19;
    const C = Math.floor(an / 100);
    const H = (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H - Math.floor(H / 28) * (1 - Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21 - G) / 11));
    const J = (an * 1 + Math.floor(an / 4) + I + 2 - C + Math.floor(C / 4)) % 7;
    const L = I - J;
    const MoisPaques = 3 + Math.floor((L + 40) / 44);
    const JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4);
    const Paques = new Date(an, MoisPaques - 1, JourPaques);
    // const VendrediSaint = new Date(an, MoisPaques - 1, JourPaques - 2);
    const LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1);
    const Ascension = new Date(an, MoisPaques - 1, JourPaques + 39);
    const Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49);
    const LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50);
    let t = [JourAn, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel];
    let sDates = [];
    for (let i = 0; i < t.length; i++) {
      sDates.push(moment(t[i]).format('DD/MM/YYYY'));
    }
    return sDates;
  }


  downloadDocument(conge){
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
        if (conge.documentJointUri) {
          // let blob = this.base64ToBlob(conge.documentJointUri, 'text/plain');
          // saveAs(blob, 'justif_'+conge.user.prenom + '_'+ conge.user.nom + "."+conge.documentJointType);
          let blob = this.base64ToBlob(conge.documentJointUri, 'application/'+ conge.documentJointType);
          if(!navigator.userAgent.match('CriOS') || !isSafari) {
            saveAs(blob, 'justif_'+conge.user.prenom + '_'+ conge.user.nom + "."+conge.documentJointType);
          } else {
            // let reader = new FileReader();
            // reader.onload = function(e){
            //   window.location.href = reader.result
            // };
            // reader.readAsDataURL(blob);
            window.open(URL.createObjectURL(blob));
          }
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
          this.congesWithFile = this.congesWithFile.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
        }
      );
  }

  getNonValidatedConges() {
    this.congesNonValides = [];
    this.allNonValidatedConges = [];
    this.monthArr = [];
    this.monthLoading = true;
    if (this.selectedUser == null) {
      this.congeService.getConges().subscribe(
        (data) => {
          for (let c of data) {
            if (!c.valideRH){
              this.allNonValidatedConges.push(c);
            }
            if(!c.valideRH && this.monthArr.indexOf(this.nomsDesMois[new Date(c.date).getMonth()]+ ' '+ new Date(c.date).getFullYear()) == -1){
              this.monthArr.push(this.nomsDesMois[new Date(c.date).getMonth()] + ' '+ new Date(c.date).getFullYear());
            }
            if (!c.valideRH && (new Date(c.date).getMonth() == this.dateNow.getMonth()) && this.congesNonValides.indexOf(c) == -1) {
              this.congesNonValides.push(c);
            }
          }
          this.congesNonValides = this.congesNonValides.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
          this.monthArr = this.monthArr.sort((a, b) => {
            a = a.split(" ");
            b = b.split(" ");
            return new Date(a[1], this.nomsDesMois.indexOf(a[0]), 1).valueOf() - new Date(b[1], this.nomsDesMois.indexOf(b[0]), 1).valueOf();
          });
          this.loading = false;
          this.monthLoading = false;
        }
      );
    } else {
      this.userService.getCongeForUser(this.selectedUser).subscribe(
        (d) => {
          for (let c of d) {
            if (!c.valideRH && (new Date(c.date).getMonth() == this.dateNow.getMonth()) && this.congesNonValides.indexOf(c) == -1) {
              this.congesNonValides.push(c);
            }
          }
          this.congesNonValides = this.congesNonValides.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
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
          this.congesValides = this.congesValides.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
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
          this.congesValides = this.congesValides.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
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
              this.allNonValidatedConges.splice(this.allNonValidatedConges.indexOf(conge),1);
              user = conge.user;
              this.congesValides.push(conge);
              let sUserCong = '';
              let dem = conge.demiJournee ? '1/2 ' : '';
              let sLine = new Date(conge.date).toLocaleDateString() + ' : ' + dem + conge.typeConge + '\n';
              sUserCong += sLine;
              this.emailService.sendMail('Bonjour ' + user.prenom + ',\n\nVotre demande pour la date de congés suivante a été validée par les Ressources Humaines :\n' + sUserCong, 'Notification de validation de congés', user.email).subscribe(
                () => {
                  this.toastrService.success('Congés validés', 'Congés validés');
                  this.getCongesWithFile();
                  this.monthArr = [];
                  for (let c of this.allNonValidatedConges) {
                    if (!c.valideRH && this.monthArr.indexOf(this.nomsDesMois[new Date(c.date).getMonth()] + ' ' + new Date(c.date).getFullYear()) == -1) {
                      this.monthArr.push(this.nomsDesMois[new Date(c.date).getMonth()] + ' ' + new Date(c.date).getFullYear());
                    }
                  }
                  this.monthArr = this.monthArr.sort((a, b) => {
                    a = a.split(" ");
                    b = b.split(" ");
                    return new Date(a[1], this.nomsDesMois.indexOf(a[0]), 1).valueOf() - new Date(b[1], this.nomsDesMois.indexOf(b[0]), 1).valueOf();
                  });
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
              this.sendValidationEmail(this.congesNonValides).then(()=>this.toastrService.success('Congés validés', 'Congés validés'));
            }
          );
        }
      });
  }

  async sendValidationEmail(arr) {
    for (let u of this.usersToSend) {
      let userCong = [];
      for (let c of arr) {
        if (c.user.id == u.id) {
          userCong.push(c);
        }
      }
      this.emailService.sendMailWithRange('Bonjour ' + u.prenom + ',\n\nVotre demande pour les dates de congés suivantes a été validée par les Ressources Humaines :\n', 'Notification de validation de congés', u.email,userCong).subscribe(
        () => {
          this.congesNonValides = [];
          this.getValidatedConges();
          for(let cong of arr){
            this.allNonValidatedConges.splice(this.allNonValidatedConges.indexOf(cong),1);
          }
          this.monthArr = [];
          for (let c of this.allNonValidatedConges) {
            if (!c.valideRH && this.monthArr.indexOf(this.nomsDesMois[new Date(c.date).getMonth()] + ' ' + new Date(c.date).getFullYear()) == -1) {
              this.monthArr.push(this.nomsDesMois[new Date(c.date).getMonth()] + ' ' + new Date(c.date).getFullYear());
            }
          }
          this.monthArr = this.monthArr.sort((a, b) => {
            a = a.split(" ");
            b = b.split(" ");
            return new Date(a[1], this.nomsDesMois.indexOf(a[0]), 1).valueOf() - new Date(b[1], this.nomsDesMois.indexOf(b[0]), 1).valueOf();
          });
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
      this.emailService.sendMailWithRange('Bonjour ' + u.prenom + ',\n\nVotre demande pour les dates de congés suivantes a été refusée par les Ressources Humaines :\n', 'Notification de refus de congés', u.email,userCong).subscribe(
        () => {
          this.congesNonValides = [];
          this.getValidatedConges();
          for(let cong of arr){
            this.allNonValidatedConges.splice(this.allNonValidatedConges.indexOf(cong),1);
          }
          this.monthArr = [];
          for (let c of this.allNonValidatedConges) {
            if (!c.valideRH && this.monthArr.indexOf(this.nomsDesMois[new Date(c.date).getMonth()] + ' ' + new Date(c.date).getFullYear()) == -1) {
              this.monthArr.push(this.nomsDesMois[new Date(c.date).getMonth()] + ' ' + new Date(c.date).getFullYear());
            }
          }
          this.monthArr = this.monthArr.sort((a, b) => {
            a = a.split(" ");
            b = b.split(" ");
            return new Date(a[1], this.nomsDesMois.indexOf(a[0]), 1).valueOf() - new Date(b[1], this.nomsDesMois.indexOf(b[0]), 1).valueOf();
          });
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
              this.emailService.sendMail('Bonjour ' + conge.user.prenom + ',\n\nVotre demande pour la date de congés suivante a été refusée par les Ressources Humaines :\n' + sUserCong, 'Notification de refus de congés', conge.user.email).subscribe(
                () => {
                  this.toastrService.error('Congé refusé', 'Congé refusé');
                  this.getCongesWithFile();
                  this.getValidatedConges();
                  this.getNonValidatedConges();
                },
                (err) => console.log(err)
              );
            }
          );
        }
      });
  }

  supprimerConge(conge: CongeModel) {
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
              this.congesValides.splice(this.congesValides.indexOf(conge), 1);
              let sUserCong = '';
              let dem = conge.demiJournee ? '1/2 ' : '';
              let sLine = new Date(conge.date).toLocaleDateString() + ' : ' + dem + conge.typeConge + '\n';
              sUserCong += sLine;
              this.emailService.sendMail('Bonjour ' + conge.user.prenom + ',\n\nVotre congé pour la date suivante a été refusé par les Ressources Humaines :\n' + sUserCong, 'Notification de suppression de congés', conge.user.email).subscribe(
                () => {
                  this.toastrService.error('Congé supprimé', 'Congé supprimé');
                  this.getCongesWithFile();
                  this.getValidatedConges();
                  this.getNonValidatedConges();
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

