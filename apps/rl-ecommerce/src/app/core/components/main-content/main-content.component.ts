import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { MobileNavComponent } from '../../../features/homepage/mobile-nav/mobile-nav.component';
import { AiChatComponent } from '../../../features/homepage/ai-chat/ai-chat.component';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../../../shared/services/layout.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    MobileNavComponent,
    AiChatComponent,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent {
  private layoutService = inject(LayoutService);
  isMenuOpened = this.layoutService.menuOpened;
}
