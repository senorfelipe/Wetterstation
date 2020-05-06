import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GraphsComponent } from './graphs/graphs.component'; 
import { WebcamComponent } from './webcam/webcam.component'; 
import { AdminComponent } from './admin/admin.component'; // Add this

const routes: Routes = [
  { path: '', component: GraphsComponent },              // Add this
  { path: 'webcam', component: WebcamComponent },
  { path: 'admin', component: AdminComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
