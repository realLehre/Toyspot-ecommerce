import { IProduct } from '../../products/model/product.interface';

export interface Parts {
  text: string;
  thoughtSignature?: string;
}

export interface PartsItem {
  parts: Parts[];
  role: string;
}

export interface AiResponse {
  actions: AiActions[];
  history: PartsItem[];
  response: string;
}

export interface AiActions {
  type: AiActionTypes;
  data: any;
  product?: IProduct;
}

type AiActionTypes =
  | 'ITEM_REMOVED_FROM_CART'
  | 'ORDER_PLACED'
  | 'TOOL_ERROR'
  | 'ITEM_ADDED_TO_CART'
  | 'PRODUCT_DETAILS_VIEWED'
  | 'ITEM_UPDATED_IN_CART'
  | 'PRODUCTS_SEARCHED';
