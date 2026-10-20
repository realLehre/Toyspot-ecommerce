import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location, NgClass } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent implements OnInit {
  router = inject(Router);
  private location = inject(Location);
  pages = input.required<{ name: string; route: string }[]>();
  fromCart = input<boolean>(false);
  newPages: { name: string; route: string }[] = [];
  refreshCart = output<void>();

  ngOnInit() {
    const pages = this.pages();
    if (pages?.length) {
      this.newPages = [{ name: 'home', route: '/' }, ...pages];
    }
  }

  getLastFragment(route: string) {
    const fragArr = route.split('/');
    const routerUrlArr = this.router.url.split('/');

    return routerUrlArr.some(
      (item) =>
        routerUrlArr[routerUrlArr.length - 1] == fragArr[fragArr.length - 1]
    );
  }

  onNavigateBack() {
    this.location.back();
  }
}
