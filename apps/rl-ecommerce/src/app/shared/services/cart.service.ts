import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ICart, ICartItems } from '../models/cart.interface';
import { Observable, of, retry, tap } from 'rxjs';
import { IProduct } from '../../features/products/model/product.interface';
import { DialogService } from 'primeng/dynamicdialog';
import { MergeCartAlertDialogComponent } from '../components/merge-cart-alert-dialog/merge-cart-alert-dialog.component';
import { AuthService } from '../../features/auth/services/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.apiUrl + 'cart';
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  user = this.authService.user;
  cartSignal = signal<ICart | null>(null);
  cartTotal = signal<number | null>(null);
  guestCart!: ICart;
  GUEST_CART_KEY = 'hd30jlsncjefysakhs';
  CART_KEY = 'sjshdy382nsj02shk02s';
  cart = signal<ICart | null>(null);
  constructor() {
    const guestCart = JSON.parse(localStorage.getItem(this.GUEST_CART_KEY)!);
    if (guestCart) {
      this.guestCart = guestCart;
    } else {
      this.createGuestCart();
    }

    const cart = JSON.parse(localStorage.getItem(this.CART_KEY)!);
    if (cart && this.user()) {
      this.cart.set(cart);
    }
  }

  getCart(): Observable<any> {
    if (this.user()) {
      return this.cart()!
        ? of(this.cart()!)
        : this.http.get<ICart>(`${this.apiUrl}/${this.user()?.id}`).pipe(
            retry(3),
            tap(() => {
              const newSignIn = sessionStorage.getItem(
                this.authService.NEW_SIGNUP_KEY,
              );
              if (newSignIn) {
                this.mergeCart().subscribe((res) =>
                  sessionStorage.removeItem(this.authService.NEW_SIGNUP_KEY),
                );
              } else {
                this.onShowMergeCartDialog();
              }
            }),
          );
    } else {
      return of(this.guestCart);
    }
  }

  createGuestCart() {
    this.guestCart = {
      id: uuidv4(),
      cartItems: [],
      createdAt: new Date().toString(),
      subTotal: 0,
      shippingCost: 0,
      updatedAt: new Date().toString(),
      userId: uuidv4(),
    };
  }

  addToCart(data: { unit: number; product: IProduct }): Observable<ICartItems> {
    if (this.user()) {
      return this.http.post<ICartItems>(`${this.apiUrl}/add`, {
        userId: this.user()?.id,
        unit: data.unit,
        productId: data.product.id,
        productPrice: data.product.price,
      });
    } else {
      const cartItem = {
        total: data.product.price * data.unit,
        unit: data.unit,
        cartId: this.guestCart.id,
        shippingCost: 100,
        product: data.product,
        id: uuidv4(),
        productId: data.product.id,
        updatedAt: new Date().toString(),
        createdAt: new Date().toString(),
      };
      return of(cartItem);
    }
  }

  updateCartItem(data: { itemId: string; unit: number; product: IProduct }) {
    if (this.user()) {
      return this.http.patch<ICartItems>(
        `${this.apiUrl}/${data.itemId}/update`,
        {
          unit: data.unit,
          productPrice: data.product.price,
        },
      );
    } else {
      const updatedItem: ICartItems = {
        ...this.guestCart?.cartItems?.find((item) => item.id === data.itemId)!,
      };
      updatedItem['unit'] = data.unit;
      updatedItem['total'] = data.unit * data.product.price;
      updatedItem['updatedAt'] = new Date().toString();

      return of(updatedItem);
    }
  }

  deleteCartItem(id: string) {
    if (this.user()) {
      return this.http.delete<ICartItems>(`${this.apiUrl}/${id}/delete`);
    } else {
      const cartItem: ICartItems = {
        ...this.guestCart.cartItems?.find((item) => item.id === id)!,
      };
      return of(cartItem);
    }
  }

  setCartAfterOperations() {
    if (this.user()) {
      this.cart.set(JSON.parse(localStorage.getItem(this.CART_KEY)!));
    } else {
      this.guestCart = {
        ...JSON.parse(localStorage.getItem(this.GUEST_CART_KEY)!),
      };
    }
  }

  resetCartOnLogout() {
    this.cart.set(null);
    this.guestCart = {
      ...JSON.parse(localStorage.getItem(this.GUEST_CART_KEY)!),
    };
  }

  onShowMergeCartDialog() {
    if (this.guestCart?.cartItems?.length) {
      this.dialogService.open(MergeCartAlertDialogComponent, {
        width: '25rem',
        breakpoints: {
          '450px': '90vw',
        },
        focusOnShow: false,
      });
    }
  }

  mergeCart() {
    return this.http
      .post<ICart>(`${this.apiUrl}/${this.user()?.id}/merge`, this.guestCart)
      .pipe(
        tap((res) => {
          localStorage.removeItem(this.GUEST_CART_KEY);
        }),
      );
  }
}
