import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { Router, RouterLink } from '@angular/router';
import { EmptyCartComponent } from './empty-cart/empty-cart.component';
import { SkeletonModule } from 'primeng/skeleton';
import { CurrencyPipe } from '@angular/common';
import { ProductQuantityComponent } from '../../shared/components/product-quantity/product-quantity.component';
import {
  ICartItemProduct,
  ICartItems,
} from '../../shared/models/cart.interface';
import { SubtotalPipe } from '../../shared/pipes/subtotal.pipe';
import { DialogModule } from 'primeng/dialog';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ProductsService } from '../products/services/products.service';
import { IProduct } from '../products/model/product.interface';
import { ToastService } from '../../shared/services/toast.service';
import { Store } from '@ngrx/store';
import {
  loadCart,
  removeItemFromCart,
  updateCartItem,
} from '../../state/cart/cart.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  selectCartLoadingOperations,
  selectCartState,
} from '../../state/state';
import { map, tap } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterLink,
    EmptyCartComponent,
    SkeletonModule,
    CurrencyPipe,
    ProductQuantityComponent,
    SubtotalPipe,
    DialogModule,
    LoaderComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private productService = inject(ProductsService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private store = inject(Store);
  cartState = toSignal(this.store.select(selectCartState));
  quantity: number = 1;
  isUpdatingIndex = signal<number | null>(null);
  showDeleteDialog = signal(false);
  activeCartItem!: ICartItems;

  isLoading = toSignal(
    this.store.select(selectCartLoadingOperations).pipe(
      tap((res) => {
        if (res.error) {
          this.toast.showToast({
            type: 'error',
            message: res.error,
          });
        } else if (res.delete?.status === 'success') {
          this.toast.showToast({
            type: 'success',
            message:
              this.activeCartItem.product.name + ' ' + 'deleted from cart!',
          });
          this.showDeleteDialog.set(false);
        }
      }),
      map((operation) => (operation.error ? false : operation.delete?.loading))
    )
  );
  updateError = signal(false);
  isUpdating: Signal<boolean[] | any> = toSignal(
    this.store.select(selectCartLoadingOperations).pipe(
      tap((res) => {
        if (res.error && res.update.status == 'error') {
          this.toast.showToast({
            type: 'error',
            message: res.error,
          });
        } else if (res.update?.status === 'success') {
          this.toast.showToast({
            type: 'success',
            message: 'Quantity adjusted',
          });
        }
      }),
      map((operation) => {
        let loadingStates = [];
        loadingStates[this.isUpdatingIndex()!] = true;

        if (operation.error) {
          loadingStates[this.isUpdatingIndex()!] = false;
          this.updateError.set(true);
        } else {
          loadingStates[this.isUpdatingIndex()!] = operation.update?.loading;
          this.updateError.set(false);
        }

        return loadingStates;
      })
    )
  );

  onAdjustQuantity(qty: number, item: ICartItems, idx: number) {
    this.isUpdatingIndex.set(idx);
    this.quantity = qty;
    this.store.dispatch(
      updateCartItem({
        itemId: item.id,
        unit: this.quantity,
        product: item.product as IProduct,
      })
    );
  }

  onDeleteDialogAction(action: string, item?: ICartItems) {
    if (item) this.activeCartItem = item;
    action === 'open'
      ? this.showDeleteDialog.set(true)
      : this.showDeleteDialog.set(false);
  }

  onDeleteCartItem() {
    this.store.dispatch(removeItemFromCart({ id: this.activeCartItem?.id }));
  }

  onViewProduct(product: ICartItemProduct) {
    this.productService.activeProduct.set(product as IProduct);
    this.router.navigate(
      ['/product/' + this.productService.createSlug(product.name)],
      {
        queryParams: { id: product.id },
      }
    );
  }

  onRefreshCart() {
    this.store.dispatch(loadCart());
  }
}
