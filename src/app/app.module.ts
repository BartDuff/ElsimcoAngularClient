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
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthenticationService} from './services/authentication.service';
import {AuthGuardService} from './services/auth-guard.service';
import {DocumentService} from './services/document.service';
import {UserService} from './services/user.service';
import {MissionService} from './services/mission.service';
import { MissionItemComponent } from './mission-item/mission-item.component';
import { UserItemComponent } from './user-item/user-item.component';
import { DocumentItemComponent } from './document-item/document-item.component';

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
    DocumentItemComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [ AuthenticationService, AuthGuardService, DocumentService, UserService, MissionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
