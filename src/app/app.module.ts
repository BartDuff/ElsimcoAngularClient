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
    MissionEditComponent
  ],
  imports: [
    AppRoutingModule,
    FileUploadModule,
    BrowserModule,
    BrowserAnimationsModule, // BrowserAnimationsModule is required
    CookieLawModule, // import Angular's CookieLaw modules
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    InputFileModule.forRoot(config),

  ],
  providers: [ AuthenticationService, AuthGuardService, DocumentService, UserService, MissionService,
     { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
