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
import {
  AdminOrderService,
  IOrderFilter,
} from './services/admin-order.service';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { IOrder, IOrderResponse } from '../../../shared/models/order.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PaginationInstance } from 'ngx-pagination';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { OrderStatusDirective } from '../../../shared/directives/order-status.directive';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Menu, MenuModule } from 'primeng/menu';
import { PrimeTemplate } from 'primeng/api';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeNgDatepickerDirective } from '../../../shared/directives/prime-ng-datepicker.directive';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    GenericTableComponent,
    NgClass,
    OrderStatusDirective,
    DatePipe,
    CurrencyPipe,
    CalendarModule,
    DecimalPipe,
    DropdownModule,
    MenuModule,
    PrimeTemplate,
    SliderModule,
    FormsModule,
    SkeletonModule,
    PrimeNgDatepickerDirective,
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(AdminOrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  orderQueried = this.orderService.orderQueried;
  private toast = inject(ToastService);
  pageSize = signal(10);
  filter = signal<IOrderFilter>({
    pageSize: this.pageSize(),
    page: 1,
  });
  refresh = signal(0);
  refreshTrigger = computed(() => ({
    filter: this.filter(),
    refresh: this.refresh(),
  }));
  holdFilter = signal<IOrderFilter>(this.filter());
  isLoading = signal(true);
  isError = signal(false);
  orders$: Observable<IOrderResponse | any> = toObservable(
    this.refreshTrigger,
  ).pipe(
    switchMap(({ filter }) =>
      this.orderService.getAllOrders(filter).pipe(
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
    this.filter.set({ ...this.filter(), search: value });
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
    this.menu.hide();
    this.selectedStatus = null;
    this.onReturn();
  }

  onViewOrder(order: IOrder) {
    this.orderService.activeOrder.set(order);
    this.router.navigate(['/', 'admin', 'orders', order.id]);
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
    this.orderService.orderSignal.set(null);
    this.filter.set({
      pageSize: 10,
      page: 1,
    });
    this.pageSize.set(10);
    this.selectedStatus = null;
    this.holdFilter.set({ ...this.filter() });
    this.isLoading.set(true);
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
