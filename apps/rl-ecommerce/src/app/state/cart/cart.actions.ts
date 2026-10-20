import { createAction, props } from '@ngrx/store';
import { ICart, ICartItems } from '../../shared/models/cart.interface';
import { IProduct } from '../../features/products/model/product.interface';
import { CartState } from './cart.reducer';

export const loadCart = createAction('[Cart] Load Cart');

export const refreshCart = createAction('[Cart] Refresh Cart');

export const loadCartSuccess = createAction(
  '[Cart] Load Cart Success',
  props<{ cart: ICart }>(),
);

export const loadCartFailure = createAction(
  '[Cart] Load Cart Failure',
  props<{ error: string }>(),
);

export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ unit: number; product: IProduct }>(),
);

export const cartItemAdded = createAction(
  '[Cart] Item Added To Cart',
  props<{ item: ICartItems | any; product: IProduct }>(),
);

export const updateCartItem = createAction(
  '[Cart] Update Cart',
  props<{ itemId: string; unit: number; product: IProduct }>(),
);

export const cartItemUpdated = createAction(
  '[Cart] Cart Item Updated',
  props<{ item: ICartItems | any }>(),
);

export const removeItemFromCart = createAction(
  '[Cart] Remove Item From Cart',
  props<{ id: string }>(),
);

export const cartItemRemoved = createAction(
  '[Cart] Item Removed From Cart',
  props<{ id: string }>(),
);

export const cartOperationError = createAction(
  '[Cart] Cart Operation Error',
  props<{ error: string; operation: keyof CartState['loadingOperations'] }>(),
);

export const mergeCart = createAction('[Cart] Merge Cart');

export const mergeCartSuccess = createAction(
  '[Cart] Merge CartSuccess',
  props<{ cart: ICart }>(),
);

export const mergeCartFailure = createAction(
  '[Cart] Merge CartFailure',
  props<{ error: string }>(),
);

export const resetOperations = createAction('[Cart] Reset Operations');

export const clearCartItems = createAction('[Cart] Clear Cart');
