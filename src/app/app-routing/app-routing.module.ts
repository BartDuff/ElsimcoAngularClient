import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from '../not-found/not-found.component';
import {LoginComponent} from '../login/login.component';
import { AuthGuardService } from '../services/auth-guard.service';
import {MissionListComponent} from '../mission-list/mission-list.component';
import {DocumentListComponent} from '../document-list/document-list.component';
import {MissionDetailsComponent} from '../mission-details/mission-details.component';
import {UserListComponent} from '../user-list/user-list.component';
import {UserDetailsComponent} from '../user-details/user-details.component';
import {DocumentDetailsComponent} from '../document-details/document-details.component';
import {MissionAddComponent} from '../mission-add/mission-add.component';
import {MissionEditComponent} from '../mission-edit/mission-edit.component';
import {UserAddComponent} from '../user-add/user-add.component';
import {UserEditComponent} from '../user-edit/user-edit.component';
import {AddContactComponent} from '../add-contact/add-contact.component';
import {ContactListComponent} from '../contact-list/contact-list.component';
import {NewsListComponent} from '../news-list/news-list.component';
import {NewsEditComponent} from '../news-edit/news-edit.component';
import {NewsAddComponent} from '../news-add/news-add.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'contact_form', component: AddContactComponent},
  { path: 'contacts', canActivate: [AuthGuardService], component: ContactListComponent},
  { path: 'missions', canActivate: [AuthGuardService], component: MissionListComponent },
  { path: 'missions/:id', canActivate: [AuthGuardService], component: MissionDetailsComponent },
  { path: 'add_missions', canActivate: [AuthGuardService], component: MissionAddComponent },
  { path: 'edit_mission/:id', canActivate: [AuthGuardService], component: MissionEditComponent },
  { path: 'news', canActivate: [AuthGuardService], component: NewsListComponent },
  { path: 'add_news', canActivate: [AuthGuardService], component: NewsAddComponent },
  { path: 'edit_news/:id', canActivate: [AuthGuardService], component: NewsEditComponent },
  { path: 'users', canActivate: [AuthGuardService], component: UserListComponent },
  { path: 'users/:id', canActivate: [AuthGuardService], component: UserDetailsComponent },
  { path: 'add_users', canActivate: [AuthGuardService], component: UserAddComponent },
  { path: 'edit_user/:id', canActivate: [AuthGuardService], component: UserEditComponent },
  { path: 'documents', canActivate: [AuthGuardService], component: DocumentListComponent },
  { path: 'documents/:id', canActivate: [AuthGuardService], component: DocumentDetailsComponent },
  { path: '', redirectTo: 'missions', pathMatch: 'full'},
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
