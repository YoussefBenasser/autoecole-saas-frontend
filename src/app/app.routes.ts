import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    children: [
      {
        path: 'student',
        loadComponent: () =>
          import('./features/auth/register/student-signup/student-signup.component').then(m => m.StudentSignupComponent)
      },
      {
        path: 'monitor',
        loadComponent: () =>
          import('./features/auth/register/monitor-signup/monitor-signup.component').then(m => m.MonitorSignupComponent)
      },
      {
        path: 'tenant',
        loadComponent: () =>
          import('./features/auth/register/tenant-signup/tenant-signup.component').then(m => m.TenantSignupComponent)
      }
    ]
  },
  {
    path: 'setup-password',
    loadComponent: () =>
      import('./features/auth/setup-password/setup-password.component').then(m => m.SetupPasswordComponent)
  },
  {
    path: 'super-admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () =>
      import('./features/super-admin/layout/super-admin-layout.component').then(m => m.SuperAdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/super-admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./features/super-admin/tenants/tenants.component').then(m => m.TenantsComponent)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/super-admin/students/students.component').then(m => m.StudentsComponent)
      }
    ]
  },
  {
    path: 'tenant',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TENANT_ADMIN'] },
    loadComponent: () =>
      import('./features/tenant/layout/tenant-layout.component').then(m => m.TenantLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/tenant/dashboard/dashboard.component').then(m => m.TenantDashboardComponent)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/tenant/students/students.component').then(m => m.StudentsComponent)
      },
      {
        path: 'monitors',
        loadComponent: () =>
          import('./features/tenant/monitors/monitors.component').then(m => m.MonitorsComponent)
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./features/tenant/exams/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/tenant/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/tenant/sessions/sessions.component').then(m => m.SessionsComponent)
      }
    ]
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT'] },
    loadComponent: () =>
      import('./features/student/layout/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
    {
      path: 'choose-school',
      loadComponent: () =>
        import('./features/student/school-selection/school-selection.component')
        .then(m => m.SchoolSelectionComponent)
    },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/student/sessions/sessions.component').then(m => m.SessionsComponent)
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./features/student/exams/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'theoretical-exam',
        loadComponent: () =>
          import('./features/student/theoretical-exam/theoretical-exam.component').then(m => m.TheoreticalExamComponent)
      }
    ]
  },
  {
    path: 'monitor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MONITOR'] },
    loadComponent: () =>
      import('./features/monitor/layout/monitor-layout.component').then(m => m.MonitorLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/monitor/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/monitor/sessions/sessions.component').then(m => m.SessionsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
