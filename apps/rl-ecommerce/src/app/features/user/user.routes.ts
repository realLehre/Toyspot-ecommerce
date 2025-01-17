import { Routes } from '@angular/router';
import { UserAccountComponent } from './user-account/user-account.component';
import { hasUnsavedChangesGuard } from '../../shared/guards/has-unsaved-changes.guard';

export const userRoutes: Routes = [
  { path: '', redirectTo: 'account-overview', pathMatch: 'full' },
  {
    path: '',
    component: UserAccountComponent,
    children: [
      {
        path: 'account-overview',
        loadComponent: () =>
          import(
            '../user/user-account/account-overview/account-overview.component'
          ).then((c) => c.AccountOverviewComponent),
      },
      {
        path: 'address-management',
        loadComponent: () =>
          import('../user/address/address.component').then(
            (c) => c.AddressComponent,
          ),
        canDeactivate: [hasUnsavedChangesGuard],
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import(
            '../user/account-management/account-management.component'
          ).then((c) => c.AccountManagementComponent),
      },
      {
        path: 'pending-reviews',
        loadComponent: () =>
          import('./pending-reviews/pending-reviews.component').then(
            (c) => c.PendingReviewsComponent,
          ),
      },
    ],
  },
];
