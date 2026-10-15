import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule, PaginationInstance } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderStatusDirective } from '../../../../shared/directives/order-status.directive';
import {
  IOrder,
  IOrderResponse,
} from '../../../../shared/models/order.interface';
import { SkeletonModule } from 'primeng/skeleton';
import {
  IUserOrderFilter,
  OrderService,
} from '../../../../shared/services/order.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { Menu, MenuModule } from 'primeng/menu';
import { PrimeTemplate } from 'primeng/api';
import { SliderModule } from 'primeng/slider';
import { CalendarModule } from 'primeng/calendar';
import { PrimeNgDatepickerDirective } from '../../../../shared/directives/prime-ng-datepicker.directive';
import { IOrderFilter } from '../../../admin/admin-orders/services/admin-order.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';

@Component({
  selector: 'app-user-orders-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    OrderStatusDirective,
    SkeletonModule,
    ReactiveFormsModule,
    MenuModule,
    PrimeTemplate,
    DropdownModule,
    SliderModule,
    CalendarModule,
    PrimeNgDatepickerDirective,
    GenericTableComponent,
  ],
  templateUrl: './user-orders-table.component.html',
  styleUrl: './user-orders-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOrdersTableComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  orderQueried = this.orderService.orderQueried;
  pageSize = signal(10);
  filter = signal<IUserOrderFilter>({
    pageSize: this.pageSize(),
    page: 1,
  });
  refresh = signal(0);
  refreshTrigger = computed(() => ({
    filter: this.filter(),
    refresh: this.refresh(),
  }));
  holdFilter = signal<IUserOrderFilter>(this.filter());
  isLoading = signal(true);
  isError = signal(false);
  orders$: Observable<IOrderResponse | any> = toObservable(
    this.refreshTrigger,
  ).pipe(
    switchMap(({ filter }) =>
      this.orderService.getOrders(filter).pipe(
        catchError((error) => {
          this.isLoading.set(false);
          this.toast.showToast({
            type: 'error',
            message: error.message || 'Failed to load order',
          });
          this.isError.set(true);
          return of(null);
        }),
      ),
    ),
    tap(() => {
      this.isLoading.set(false);
    }),
  );
  ordersData: Signal<IOrderResponse> = toSignal(this.orders$);
  sortUsed: boolean = false;
  sortDirection: 'asc' | 'desc' = 'asc';
  deliveryStatus: { name: string; code: string }[] = [
    { name: 'Pending', code: 'PENDING' },
    { name: 'Packed', code: 'PACKED' },
    { name: 'Delivered', code: 'DELIVERED' },
  ];
  selectedStatus: { name: string; code: string } | null = null;
  rangeValues = [2000, 10000];
  rangeDates: any[] = [];
  @ViewChild('menu') menu!: Menu;
  filterNumber = 0;

  ngOnInit() {
    const savedFilters = JSON.parse(
      sessionStorage.getItem(this.orderService.ORDER_QUERY_STORED_KEY) || '{}',
    );
    this.holdFilter.set({
      ...savedFilters,
      pageSize: savedFilters?.pageSize ?? 10,
    });

    const currentFilter = this.holdFilter();

    this.filterNumber = this.orderService.findFilterNumber(currentFilter);

    if (currentFilter.minPrice && currentFilter.maxPrice) {
      this.rangeValues = [currentFilter.minPrice!, currentFilter.maxPrice!];
    }

    if (currentFilter.minDate && currentFilter.maxDate) {
      this.rangeDates = [
        this.orderService.formatDateToLocale(currentFilter.minDate),
        this.orderService.formatDateToLocale(currentFilter.maxDate),
      ];
    }

    if (currentFilter.deliveryStatus) {
      this.selectedStatus = this.deliveryStatus.find(
        (status) => status.code == currentFilter.deliveryStatus,
      )!;
    }

    if (currentFilter.pageSize) {
      this.pageSize.set(currentFilter.pageSize!);
    }

    if (currentFilter.page) {
    }

    const newRouteQueries = Object.fromEntries(
      Object.entries(this.orderService.createRouteQuery(currentFilter)).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    this.filter.set({ ...this.filter(), ...currentFilter });

    this.router.navigate([], {
      queryParams: newRouteQueries,
      relativeTo: this.route,
    });
  }

  onRetryLoad() {
    this.refresh.update((count) => count + 1);
    this.isError.set(false);
  }

  pageChange(page: number) {
    this.isLoading.set(true);
    this.filter.set({ ...this.filter(), page });
    this.updateQueries({ page: page });
    window.scrollTo({
      top: 70,
      behavior: 'smooth',
    });
  }

  pageSizeChange(total: number) {
    this.pageSize.set(total);
    this.isLoading.set(true);
    this.filter.set({ ...this.filter(), page: 1, pageSize: total });
    this.updateQueries({ pageSize: total });
  }

  onRangeValueChanged(value: any[]) {
    this.updateQueries({ minPrice: value[0], maxPrice: value[1] });
  }

  searchChanged(value: any) {
    this.isLoading.set(true);
    this.filter.set({ ...this.filter(), orderId: value });
    this.updateQueries({ search: value });
  }

  onDateChanged() {
    if (this.rangeDates[0] && this.rangeDates[1]) {
      let dates = [...this.rangeDates];
      dates = dates.map((date) => this.orderService.formatDate(date));
      this.updateQueries({ page: 1, minDate: dates[0], maxDate: dates[1] });
    }
  }

  onChangeOrderStatus(status: { name: string; code: string }) {
    this.selectedStatus = status;
    this.updateQueries({ page: 1, deliveryStatus: status.code });
  }

  onClearFilter() {
    if (this.filterNumber == 0) {
      return;
    }
    this.selectedStatus = null;
    this.menu.hide();
    this.onReturn();
  }

  onViewOrder(order: IOrder) {
    this.orderService.activeOrder.set(order);
    this.router.navigate(['/', 'orders', order.id]);
  }

  updateQueries(updates: Partial<IOrderFilter>) {
    this.orderService.orderSignal.set(null);
    this.holdFilter.set({ ...this.holdFilter(), ...updates });
    sessionStorage.setItem(
      this.orderService.ORDER_QUERY_STORED_KEY,
      JSON.stringify(this.holdFilter()),
    );
    this.router.navigate([], {
      queryParams: this.orderService.createRouteQuery(this.filter()),
      relativeTo: this.route,
    });
  }

  onApplyFilter() {
    this.isLoading.set(true);
    this.filter.set({ ...this.holdFilter() });
    this.filterNumber = this.orderService.findFilterNumber(this.filter());
    sessionStorage.setItem(
      this.orderService.ORDER_QUERY_STORED_KEY,
      JSON.stringify(this.filter()),
    );
    this.router.navigate([], {
      queryParams: this.orderService.createRouteQuery(this.filter()),
      relativeTo: this.route,
    });
    this.menu.hide();
  }

  onReturn() {
    this.rangeDates = [];
    this.rangeValues = [2000, 10000];
    sessionStorage.removeItem(this.orderService.ORDER_QUERY_STORED_KEY);
    this.filterNumber = 0;
    this.orderService.orderQueried.set(false);
    this.router.navigate([], {
      queryParams: { page: 1, pageSize: 10 },
      queryParamsHandling: 'replace',
      relativeTo: this.route,
    });
    this.isLoading.set(true);
    this.orderService.orderSignal.set(null);
    this.filter.set({
      pageSize: 10,
      page: 1,
    });
    this.pageSize.set(10);
    this.selectedStatus = null;
    this.holdFilter.set({ ...this.filter() });
  }

  sortTable(column: any): void {
    const { sortedData, sortDirection, sortUsed } = this.orderService.sortTable(
      column,
      this.ordersData(),
    );
    this.orders$ = of(sortedData);
    this.sortDirection = sortDirection;
    this.sortUsed = sortUsed;
  }
}
