import {
  Component,
  inject,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ProductsService } from '../../products/services/products.service';
import { CartService } from '../../../shared/services/cart.service';
import { OrderService } from '../../../shared/services/order.service';
import { AuthService } from '../../auth/services/auth.service';
import { AiChatService } from './ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  imports: [],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
  standalone: true,
})
export class AiChatComponent {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private aiChatService = inject(AiChatService);

  isOpen = signal(false);
  isLoading = signal(false);
  userInput = signal('');
  chatHistory = this.aiChatService.chatHistory;
  backgroundHistory = this.aiChatService.chatHistory;
  chatError = signal(false);

  protected readonly userClasses = 'bg-[#800020] text-white rounded-br-none';
  protected readonly aiClasses =
    'bg-white text-type_title border border-border_subtle rounded-bl-none';

  messagesContainer = viewChild<ElementRef>('messagesScroll');

  toggleChat() {
    this.isOpen.update((val) => !val);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.userInput.set(target.value);
  }

  sendMessage(action?: string) {
    const text =
      action === 'resend'
        ? this.chatHistory()[this.chatHistory().length - 1].parts[0].text
        : this.userInput().trim();
    if (!text) return;

    this.userInput.set('');
    this.isLoading.set(true);
    if (!this.chatError()) {
      this.addUserMessage(text);
    }
    this.scrollToBottom();
    this.chatError.set(false);

    this.aiChatService
      .postChat({ message: text, history: this.backgroundHistory() })
      .subscribe({
        next: (response) => {
          const formatedHistory = this.aiChatService.formatHistory(
            response.history,
          );
          this.chatHistory.set(formatedHistory);
          this.backgroundHistory.set(formatedHistory);
          console.log(response);
          this.isLoading.set(false);
          this.scrollToBottom();
        },
        error: (error) => {
          console.error(error);
          this.chatError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private addUserMessage(text: string) {
    this.chatHistory.update((msgs) => [
      ...msgs,
      {
        parts: [{ text }],
        role: 'user',
      },
    ]);
  }

  private scrollToBottom() {
    const container = this.messagesContainer();
    if (container) {
      setTimeout(() => {
        container.nativeElement.scrollTo({
          top: container.nativeElement.scrollHeight,
        });
      }, 50);
    }
  }
}
