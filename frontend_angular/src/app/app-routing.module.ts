import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardEmployeComponent } from './dashboard-employe/dashboard-employe.component';
import { ProfileEmployeComponent } from './profile-employe/profile-employe.component';
import { MemberComponent } from './member/member.component';
import { MemberFormComponent } from './member-form/member-form.component';
import { ProjetComponent } from './projet/projet.component';
import { ProjetFormComponent } from './projet-form/projet-form.component';
import { CategorieComponent } from './categorie/categorie.component';
import { CategorieFormComponent } from './categorie-form/categorie-form.component';

import { AuthGuard } from '../Services/auth.guard';
import { AdminGuard } from '../Services/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },

  { path: 'members', component: MemberComponent, canActivate: [AdminGuard] },
  { path: 'members/create', component: MemberFormComponent, canActivate: [AdminGuard] },
  { path: 'members/:id/edit', component: MemberFormComponent, canActivate: [AdminGuard] },

  { path: 'projets/create', component: ProjetFormComponent, canActivate: [AdminGuard] },
  { path: 'projets/:id/edit', component: ProjetFormComponent, canActivate: [AdminGuard] },
  { path: 'projets', component: ProjetComponent, canActivate: [AdminGuard] },

  { path: 'categories/create', component: CategorieFormComponent, canActivate: [AdminGuard] },
  { path: 'categories/:id/edit', component: CategorieFormComponent, canActivate: [AdminGuard] },
  { path: 'categories', component: CategorieComponent, canActivate: [AdminGuard] },

  // Ancienne URL gardée pour compatibilité : la gestion des affectations est maintenant dans la page Projets.
  { path: 'affectations', redirectTo: 'projets', pathMatch: 'full' },

  { path: 'dashboard-employe', component: DashboardEmployeComponent, canActivate: [AuthGuard] },
  { path: 'profile-employe', component: ProfileEmployeComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
