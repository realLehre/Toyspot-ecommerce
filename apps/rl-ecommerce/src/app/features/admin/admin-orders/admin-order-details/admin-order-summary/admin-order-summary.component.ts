import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { IOrder } from '../../../../../shared/models/order.interface';

@Component({
  selector: 'app-admin-order-summary',
  standalone: true,
  imports: [NgTemplateOutlet, CurrencyPipe, DatePipe],
  templateUrl: './admin-order-summary.component.html',
  styleUrl: './admin-order-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderSummaryComponent {
  order = input<IOrder>({} as IOrder);
}
