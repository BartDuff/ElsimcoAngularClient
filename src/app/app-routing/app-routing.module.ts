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

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'missions', component: MissionListComponent },
  { path: 'missions/:id', canActivate: [AuthGuardService], component: MissionDetailsComponent },
  { path: 'users', canActivate: [AuthGuardService], component: UserListComponent },
  { path: 'users/:id', canActivate: [AuthGuardService], component: UserDetailsComponent },
  { path: 'documents', canActivate: [AuthGuardService], component: DocumentListComponent },
  { path: '', redirectTo: 'missions', pathMatch: 'full'},
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
