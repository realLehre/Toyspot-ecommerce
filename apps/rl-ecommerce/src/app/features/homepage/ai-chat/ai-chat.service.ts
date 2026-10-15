import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AiResponse, Parts, PartsItem } from './ai-chat.interface';
import { Observable } from 'rxjs';
import { ICartItems } from '../../../shared/models/cart.interface';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  url = environment.apiUrl + 'ai/chat';
  private readonly http = inject(HttpClient);
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

  formatHistory(history: PartsItem[]) {
    return history.filter((h) => {
      const partKeys = Object.keys(h.parts[0]);

      return !!partKeys.find((p) => p.includes('text'));
    });
  }

  // private processAiResponse(query: string) {
  //   const lower = query.toLowerCase();
  //
  //   if (
  //     lower.includes('age') ||
  //     lower.includes('recent') ||
  //     lower.includes('new') ||
  //     lower.includes('under') ||
  //     lower.includes('days') ||
  //     lower.includes('month')
  //   ) {
  //     const match = lower.match(/\d+/);
  //     const maxDays = match ? parseInt(match[0], 10) : 30;
  //
  //     this.productsService.getProducts().subscribe({
  //       next: (res) => {
  //         if (!res || !res.products) {
  //           this.addAiMessage(
  //             "I couldn't fetch the products right now. Please try again later.",
  //           );
  //           return;
  //         }
  //         const now = new Date().getTime();
  //         const filtered = res.products.filter((p) => {
  //           if (!p.createdAt) return false;
  //           const created = new Date(p.createdAt).getTime();
  //           const diffDays = (now - created) / (1000 * 3600 * 24);
  //           return diffDays <= maxDays;
  //         });
  //
  //         if (filtered.length === 0) {
  //           this.addAiMessage(
  //             `I found no products created within the last ${maxDays} days. We have plenty of other exciting action figures and toys!`,
  //           );
  //         } else {
  //           const productNames = filtered
  //             .map(
  //               (p) =>
  //                 `• **${p.name}** ($${p.price}) - added ${Math.floor((now - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24))} days ago`,
  //             )
  //             .join('\n');
  //           this.addAiMessage(
  //             `Here are products under ${maxDays} days old:\n\n${productNames}`,
  //           );
  //         }
  //       },
  //       error: () => {
  //         this.addAiMessage(
  //           'Sorry, I encountered an error while fetching product data.',
  //         );
  //       },
  //     });
  //   } else if (
  //     lower.includes('order') ||
  //     lower.includes('buy') ||
  //     lower.includes('purchase')
  //   ) {
  //     const user = this.authService.user();
  //     if (!user) {
  //       this.addAiMessage(
  //         'You need to be logged in to place an order. Please log in or sign up first, then I can place your order!',
  //       );
  //       return;
  //     }
  //
  //     this.cartService.getCart().subscribe({
  //       next: (cart) => {
  //         if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
  //           this.addAiMessage(
  //             'Your cart is empty! Add some toys or action figures to your cart first, and then ask me to place your order.',
  //           );
  //           return;
  //         }
  //
  //         const defaultAddress = {
  //           id: 'default',
  //           userId: user.id,
  //           fullName: user.name || 'Valued Customer',
  //           phoneNumber: user.phoneNumber || '08012345678',
  //           streetAddress: '123 Hero Street',
  //           city: 'Lagos',
  //           state: 'Lagos State',
  //           country: 'Nigeria',
  //           isDefault: true,
  //         };
  //
  //         this.orderService
  //           .placeOrder({
  //             address: defaultAddress,
  //             cart: cart,
  //             paymentMethod: 'PAYSTACK',
  //           })
  //           .subscribe({
  //             next: () => {
  //               this.addAiMessage(
  //                 '🎉 Your order has been successfully placed! You can view your order status in your account dashboard.',
  //               );
  //             },
  //             error: () => {
  //               this.addAiMessage(
  //                 'I tried placing your order, but something went wrong. Please check your shipping address and cart items.',
  //               );
  //             },
  //           });
  //       },
  //       error: () => {
  //         this.addAiMessage(
  //           'Could not retrieve your cart items. Please check your cart page.',
  //         );
  //       },
  //     });
  //   } else if (lower.includes('cart') || lower.includes('basket')) {
  //     this.cartService.getCart().subscribe({
  //       next: (cart) => {
  //         if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
  //           this.addAiMessage('Your cart is currently empty.');
  //           return;
  //         }
  //         const itemsList = cart.cartItems
  //           .map(
  //             (item: ICartItems) =>
  //               `• ${item.unit}x ${item.product?.name || 'Item'} ($${item.total})`,
  //           )
  //           .join('\n');
  //         this.addAiMessage(
  //           `Here is what's in your cart:\n\n${itemsList}\n\nSubTotal: $${cart.subTotal || 0}`,
  //         );
  //       },
  //       error: () => {
  //         this.addAiMessage('Could not fetch your cart at the moment.');
  //       },
  //     });
  //   } else if (
  //     lower.includes('category') ||
  //     lower.includes('categories') ||
  //     lower.includes('what do you sell')
  //   ) {
  //     this.addAiMessage(
  //       'We offer a wide variety of toys and action figures including Action Figures, Plush Toys, Remote-Controlled Cars, Board Games, and Educational Toys!',
  //     );
  //   } else if (
  //     lower.includes('hello') ||
  //     lower.includes('hi') ||
  //     lower.includes('hey')
  //   ) {
  //     this.addAiMessage(
  //       'Hello! How can I assist your shopping experience today?',
  //     );
  //   } else {
  //     this.addAiMessage(
  //       "I can help you find products (e.g. 'products under 14 days old'), check your cart, or place orders for you. What would you like to do?",
  //     );
  //   }
  // }
}
