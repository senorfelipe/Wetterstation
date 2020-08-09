import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { AuthGuardService as AuthGuard} from './auth-guard.service';

import { GraphsComponent } from './graphs/graphs.component'; 
import { WebcamComponent } from './webcam/webcam.component'; 
import { AdminComponent } from './admin/admin.component';
import { AdminpanelComponent } from './adminpanel/adminpanel.component'; // Add this

const routes: Routes = [
  { path: '', component: GraphsComponent },              // Add this
  { path: 'webcam', component: WebcamComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'adminpanel', component: AdminpanelComponent, canActivate: [AuthGuard] }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
