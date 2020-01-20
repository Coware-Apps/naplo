import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './_guards/login.guard';

const routes: Routes = [
  { path: '', redirectTo: 'timetable', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },

  { path: 'timetable', loadChildren: () => import('./timetable/timetable.module').then(m => m.TimetablePageModule), canActivate: [LoginGuard] },
  { path: 'evaluation', loadChildren: () => import('./evaluation/evaluation.module').then(m => m.EvaluationPageModule), canActivate: [LoginGuard] },
  { path: 'notlogged', loadChildren: () => import('./notlogged/notlogged.module').then(m => m.NotloggedPageModule), canActivate: [LoginGuard] },
  { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule), canActivate: [LoginGuard] },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
