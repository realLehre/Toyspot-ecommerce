import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { SliderModule } from 'primeng/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProductOptionsService } from '../services/product-options.service';
import { ProductsService } from '../../products/services/products.service';
import { LayoutService } from '../../../shared/services/layout.service';
import { NumbersOnlyDirective } from '../../../shared/directives/number-only.directive';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    NgClass,
    SliderModule,
    ReactiveFormsModule,
    CheckboxModule,
    FormsModule,
    DecimalPipe,
    RadioButtonModule,
    NumbersOnlyDirective,
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  private optionsService = inject(ProductOptionsService);
  private layoutService = inject(LayoutService);
  private productService = inject(ProductsService);
  isShowing = signal<boolean[]>([true, true]);
  currentPriceFilter = this.optionsService.currentPriceFilter;
  rangeValues = computed(() => {
    if (this.currentPriceFilter()) {
      return [+this.currentPriceFilter()?.min, +this.currentPriceFilter()?.max];
    } else {
      return [2000, 10000];
    }
  });
  value: number = 50;
  currentSort = this.optionsService.currentSort;
  currentRatingFilter = this.optionsService.currentRating;
  stars = signal(
    Array.from({ length: 5 }, (_, i) => ({ star: i + 1, active: false })),
  );
  numberOfFilters = this.optionsService.numberOfFilters;

  onApplyPriceFilter() {
    this.productService.productSignal.set(null);
    this.optionsService.currentPage.set(1);
    this.optionsService.currentPriceFilter.set({
      min: this.rangeValues()[0],
      max: this.rangeValues()[1],
    });
    this.layoutService.mobileFilterOpened.set(false);
    this.optionsService.setDataAndRoute();
  }

  onRangeValuesChange(event: any) {
    this.currentPriceFilter.set(null);
  }

  onSelectRatingFilter(rating: number) {
    this.currentRatingFilter.set(rating);
    this.layoutService.mobileFilterOpened.set(false);
    this.productService.productSignal.set(null);
    this.optionsService.currentPage.set(1);
    this.optionsService.currentRating.set(rating);
    this.optionsService.setDataAndRoute();
  }

  onSortOrder(sort: string) {
    this.layoutService.mobileFilterOpened.set(false);
    if (
      this.currentSort() === sort ||
      (!this.currentSort() && sort === 'old')
    ) {
      return;
    }
    this.productService.productSignal.set(null);
    this.optionsService.currentSort.set(sort);
    this.optionsService.setDataAndRoute();
  }

  onClearFilter() {
    this.productService.productSignal.set(null);
    this.layoutService.mobileFilterOpened.set(false);
    this.currentPriceFilter.set(null);
    this.optionsService.clearFilter();
  }

  onToggleFilter(index: number) {
    const newArray = [...this.isShowing()];
    newArray[index] = !newArray[index];

    this.isShowing.set(newArray);
  }

  onResetRatingFilter() {
    this.optionsService.currentRating.set(null);
    this.productService.productSignal.set(null);
    this.optionsService.setDataAndRoute();
  }

  protected updateRange(type: string) {
    if (type === 'min') {
      this.currentPriceFilter.update((current) => ({
        min: +this.rangeValues()[0],
        max: current ? current.max : null,
      }));
    } else {
      this.currentPriceFilter.update((current) => ({
        min: current ? current.min : null,
        max: +this.rangeValues()[1],
      }));
    }
  }
}
