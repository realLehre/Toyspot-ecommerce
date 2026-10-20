import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AiActions, AiResponse, Parts, PartsItem } from './ai-chat.interface';
import { Observable } from 'rxjs';
import { ICartItems } from '../../../shared/models/cart.interface';
import { CartService } from '../../../shared/services/cart.service';
import { ToastService } from '../../../shared/services/toast.service';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  url = environment.apiUrl + 'ai/chat';
  private readonly http = inject(HttpClient);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  chatHistory = signal<PartsItem[]>([]);

  postChat(data: {
    message: string;
    history: PartsItem[];
  }): Observable<AiResponse> {
    return this.http.post<AiResponse>(this.url, {
      message: data.message,
      history: data.history,
    });
  }

  performActions(actions: AiActions[]) {
    const addToCartOperations = new Set<AiActions>();
    const updateCartOperations = new Set<AiActions>();

    for (const a of actions) {
      if (a.type === 'ITEM_ADDED_TO_CART') {
        addToCartOperations.add(a);
      }

      if (a.type === 'ITEM_UPDATED_IN_CART') {
        updateCartOperations.add(a);
      }

      if (a.type === 'ITEM_REMOVED_FROM_CART') {
        this.cartService.refreshCart();
        this.toast.showToast({
          type: 'success',
          message: `Cart updated!`,
        });
      }
    }

    if (addToCartOperations.size > 0) {
      this.cartService.refreshCart();
      this.toast.showToast({
        type: 'success',
        message: `Item${addToCartOperations.size > 1 ? 's' : ''} updated in cart!`,
      });
    }

    if (updateCartOperations.size > 0) {
      this.cartService.refreshCart();
      this.toast.showToast({
        type: 'success',
        message: `Item${updateCartOperations.size > 1 ? 's' : ''} updated in cart!`,
      });
    }
  }

  formatHistory(history: PartsItem[]) {
    return history.filter((h) => {
      const partKeys = Object.keys(h.parts[0]);

      return !!partKeys.find((p) => p.includes('text'));
    });
  }
}
