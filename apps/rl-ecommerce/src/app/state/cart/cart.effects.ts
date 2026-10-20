import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CartService } from '../../shared/services/cart.service';
import { Store } from '@ngrx/store';
import {
  addToCart,
  cartItemAdded,
  cartItemRemoved,
  cartItemUpdated,
  cartOperationError,
  clearCartItems,
  loadCart,
  loadCartFailure,
  loadCartSuccess,
  mergeCart,
  mergeCartFailure,
  mergeCartSuccess,
  refreshCart,
  removeItemFromCart,
  resetOperations,
  updateCartItem,
} from './cart.actions';
import {
  catchError,
  concatMap,
  delay,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { selectCartState } from '../state';
import { logout_clearState } from '../state.actions';

@Injectable()
export class CartEffects {
  private actions$ = inject(Actions);
  private cartService = inject(CartService);
  private store = inject(Store);

  loadCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCart || refreshCart),
      switchMap(() =>
        this.cartService.getCart().pipe(
          map((res) => loadCartSuccess({ cart: res! })),
          catchError((err) =>
            of(loadCartFailure({ error: err.error.message })),
          ),
        ),
      ),
    );
  });

  refreshCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(refreshCart),
      switchMap(() =>
        this.cartService.fetchCart().pipe(
          map((res) => loadCartSuccess({ cart: res! })),
          catchError((err) =>
            of(loadCartFailure({ error: err.error.message })),
          ),
        ),
      ),
    );
  });

  mergeCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(mergeCart),
      concatMap(() =>
        this.cartService.mergeCart().pipe(
          map((res) => mergeCartSuccess({ cart: res })),
          catchError((err) =>
            of(mergeCartFailure({ error: err.error.message })),
          ),
        ),
      ),
    );
  });

  addItemToCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addToCart),
      concatMap((actionRes) =>
        this.cartService.addToCart(actionRes).pipe(
          map((res) =>
            cartItemAdded({ item: res, product: actionRes.product }),
          ),
          catchError((err) =>
            of(
              cartOperationError({
                error: err.error.message,
                operation: 'add',
              }),
            ),
          ),
        ),
      ),
    );
  });

  removeItemFromCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeItemFromCart),
      mergeMap(({ id }) =>
        this.cartService.deleteCartItem(id).pipe(
          map(() => cartItemRemoved({ id })),
          catchError((err) =>
            of(
              cartOperationError({
                error: err.error.message,
                operation: 'delete',
              }),
            ),
          ),
        ),
      ),
    );
  });

  updateCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateCartItem),
      concatMap((res) =>
        this.cartService.updateCartItem(res).pipe(
          map((res) => cartItemUpdated({ item: res })),
          catchError((err) =>
            of(
              cartOperationError({
                error: err.error.message,
                operation: 'update',
              }),
            ),
          ),
        ),
      ),
    );
  });

  saveStateToStorage = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          loadCartSuccess,
          cartItemAdded,
          cartItemRemoved,
          cartItemUpdated,
          mergeCartSuccess,
          clearCartItems,
        ),
        withLatestFrom(this.store.select(selectCartState)),
        tap(([action, state]) => {
          if (this.cartService.user()) {
            localStorage.setItem(
              this.cartService.CART_KEY,
              JSON.stringify(state.cart),
            );
          } else {
            localStorage.setItem(
              this.cartService.GUEST_CART_KEY,
              JSON.stringify({
                ...state.cart,
                updatedAt: new Date().toString(),
              }),
            );
          }
          this.cartService.setCartAfterOperations();
        }),
      );
    },
    { dispatch: false },
  );

  logOut$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(logout_clearState),
        tap(() => {
          this.cartService.resetCartOnLogout();
        }),
      );
    },
    { dispatch: false },
  );

  resetOperations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(cartItemAdded, cartItemRemoved, cartItemUpdated),
      delay(500),
      map(() => resetOperations()),
    );
  });

  // showToastNotification$ = createEffect(
  //   () => {
  //     return this.actions$.pipe(
  //       ofType(cartOperationError),
  //       withLatestFrom(this.store.select(selectCartLoadingOperations)),
  //       debounceTime(300), // Debounce to prevent rapid successive toasts
  //       map(([action, loadingOperations]) => {
  //         if (loadingOperations.error) {
  //           this.toast.showToast({
  //             type: 'error',
  //             message: loadingOperations.error,
  //           });
  //         }
  //       }),
  //     );
  //   },
  //   { dispatch: false },
  // );
}
