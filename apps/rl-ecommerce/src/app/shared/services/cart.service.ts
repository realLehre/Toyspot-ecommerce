import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserAccountService } from '../../features/user/user-account/services/user-account.service';
import { ICart, ICartItems } from '../models/cart.interface';
import { map, of, tap } from 'rxjs';
import { IProduct } from '../../features/products/model/product.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.apiUrl + 'cart';
  private http = inject(HttpClient);
  private userService = inject(UserAccountService);
  user = this.userService.user;
  cartSignal = signal<ICart | null>(null);
  cartTotal = signal<number | null>(null);
  guestCart: Partial<ICart> = {
    cartItems: [],
  };
  STORAGE_KEY = 'hd30jlsncjefysakhs';
  constructor() {
    const guestCart = JSON.parse(localStorage.getItem(this.STORAGE_KEY)!);

    if (guestCart) this.guestCart = guestCart;
  }

  getCart() {
    if (this.user()) {
      return this.cartSignal()
        ? of(this.cartSignal())
        : this.http.get<ICart>(`${this.apiUrl}/${this.user()?.id}`).pipe(
            tap((res) => {
              this.cartSignal.set(res);
              this.cartTotal.set(res.cartItems.length);
              this.mergeCart()?.subscribe();
            }),
          );
    } else {
      this.cartTotal.set(this.guestCart.cartItems!.length);
      this.cartSignal.set(this.guestCart as ICart);
      return of(this.guestCart as ICart);
    }
  }

  addToCart(data: { unit: number; product: IProduct }) {
    if (this.user()) {
      return this.http.post(`${this.apiUrl}/add`, {
        userId: this.user()?.id,
        unit: data.unit,
        productId: data.product.id,
        productPrice: data.product.price,
      });
    } else {
      const guestCartItem: Partial<ICartItems> = {
        total: data.product.price * data.unit,
        unit: data.unit,
        shippingCost: 100,
        product: data.product,
        id: this.generateRandomId(),
      };
      this.guestCart.cartItems?.push(guestCartItem as ICartItems);
      this.cartSignal.set(this.guestCart as ICart);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.guestCart));
      return of(this.guestCart);
    }
  }

  updateCartItem(data: { itemId: string; unit: number; productPrice: number }) {
    if (this.user()) {
      return this.http.patch(`${this.apiUrl}/${data.itemId}/update`, {
        unit: data.unit,
        productPrice: data.productPrice,
      });
    } else {
      this.guestCart.cartItems = this.guestCart.cartItems?.map((item) => {
        if (item.id == data.itemId) {
          item.unit = data.unit;
          item.total = data.unit * item.product.price;
        }
        return item as ICartItems;
      });
      this.cartSignal.set(this.guestCart as ICart);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.guestCart));
      return of(this.guestCart);
    }
  }

  deleteCartItem(id: string) {
    if (this.user()) {
      return this.http.delete(`${this.apiUrl}/${id}/delete`);
    } else {
      this.guestCart.cartItems = this.guestCart.cartItems?.filter(
        (item) => item.id !== id,
      );
      this.cartSignal.set(this.guestCart as ICart);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.guestCart));
      return of(this.guestCart);
    }
  }

  mergeCart() {
    if (this.guestCart.cartItems?.length) {
      return this.http
        .post<ICart>(`${this.apiUrl}/${this.user()?.id}/merge`, this.guestCart)
        .pipe(
          tap((res) => {
            localStorage.removeItem(this.STORAGE_KEY);
            this.cartSignal.set(res);
            this.cartTotal.set(res.cartItems.length);
          }),
        );
    }
    return;
  }

  generateRandomId(length: number = 10): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}
