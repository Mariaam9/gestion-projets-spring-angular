import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Gestion Projets';
  isLoginPage = false;
  isEmployeeDashboardPage = false;

  constructor(private router: Router) {
    this.updateLayoutFlags(this.router.url);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.updateLayoutFlags(event.urlAfterRedirects || event.url));
  }

  private updateLayoutFlags(url: string): void {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    this.isLoginPage = cleanUrl.includes('/login');
    this.isEmployeeDashboardPage = cleanUrl.includes('/dashboard-employe') || cleanUrl.includes('/profile-employe');
  }
}
