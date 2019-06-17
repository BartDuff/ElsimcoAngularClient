import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {RouterModule} from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { MissionListComponent } from './mission-list/mission-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { MissionDetailsComponent } from './mission-details/mission-details.component';
import { DocumentDetailsComponent } from './document-details/document-details.component';
import {AppRoutingModule} from './app-routing/app-routing.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthenticationService} from './services/authentication.service';
import {AuthGuardService} from './services/auth-guard.service';
import {DocumentService} from './services/document.service';
import {UserService} from './services/user.service';
import {MissionService} from './services/mission.service';
import { MissionItemComponent } from './mission-item/mission-item.component';
import { UserItemComponent } from './user-item/user-item.component';
import { DocumentItemComponent } from './document-item/document-item.component';
import {BasicAuthInterceptor} from './helpers/basic-auth.interceptor';
import {ErrorInterceptor} from './helpers/error.interceptor';
import { UserAddComponent } from './user-add/user-add.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { MissionAddComponent } from './mission-add/mission-add.component';
import { MissionEditComponent } from './mission-edit/mission-edit.component';
import {FileUploadModule} from 'ng2-file-upload';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CookieLawModule} from 'angular2-cookie-law';
import { InputFileConfig, InputFileModule } from 'ngx-input-file';
import { EmailDialogComponent } from './dialog/email-dialog/email-dialog.component';
import { ConfirmDialogComponent } from './dialog/confirm-dialog/confirm-dialog.component';
import {MatDialogModule, MatInputModule} from '@angular/material';
import { AddContactComponent } from './add-contact/add-contact.component';
import {CommonModule} from '@angular/common';
import {ToastrModule} from 'ngx-toastr';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactItemComponent } from './contact-item/contact-item.component';
import { NewsListComponent } from './news-list/news-list.component';
import { NewsItemComponent } from './news-item/news-item.component';
import { NewsAddComponent } from './news-add/news-add.component';
import { NewsEditComponent } from './news-edit/news-edit.component';
const config: InputFileConfig = {};


@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    HeaderComponent,
    MissionListComponent,
    UserListComponent,
    DocumentListComponent,
    UserDetailsComponent,
    MissionDetailsComponent,
    DocumentDetailsComponent,
    MissionItemComponent,
    UserItemComponent,
    DocumentItemComponent,
    UserAddComponent,
    UserEditComponent,
    MissionAddComponent,
    MissionEditComponent,
    EmailDialogComponent,
    ConfirmDialogComponent,
    AddContactComponent,
    ContactListComponent,
    ContactItemComponent,
    NewsListComponent,
    NewsItemComponent,
    NewsAddComponent,
    NewsEditComponent
  ],
  imports: [
    AppRoutingModule,
    FileUploadModule,
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule, // BrowserAnimationsModule is required
    CookieLawModule, // import Angular's CookieLaw modules
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    HttpClientModule,
    InputFileModule.forRoot(config),
    ToastrModule.forRoot(),
    MatInputModule,

  ],
  providers: [ AuthenticationService, AuthGuardService, DocumentService, UserService, MissionService,
     { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent, EmailDialogComponent]
})
export class AppModule { }
