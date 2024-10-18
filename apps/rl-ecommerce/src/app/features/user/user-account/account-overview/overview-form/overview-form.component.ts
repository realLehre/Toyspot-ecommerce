import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ErrorMessageDirective } from '../../../address/address-form/directives/error-message.directive';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService, IUser } from '../../../../auth/services/auth.service';
import { AddressService } from '../../../address/services/address.service';
import { UserAccountService } from '../../services/user-account.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, switchMap, tap } from 'rxjs';
import { LoaderComponent } from '../../../../../shared/components/loader/loader.component';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-overview-form',
  standalone: true,
  imports: [
    ErrorMessageDirective,
    ReactiveFormsModule,
    NgClass,
    LoaderComponent,
  ],
  templateUrl: './overview-form.component.html',
  styleUrl: './overview-form.component.scss',
})
export class OverviewFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private toastService = inject(ToastService);
  private userAccountService = inject(UserAccountService);
  user = input.required<IUser | null>();
  profileForm!: FormGroup;
  cancelEdit = output<void>();
  isLoading = signal(false);

  ngOnInit() {
    this.profileForm = this.fb.group({
      fullName: [this.user()?.name, Validators.required],
      email: [this.user()?.email, Validators.required],
      phoneNumber: [
        this.user()?.phoneNumber ?? null,
        [Validators.required, this.addressService.phoneNumberValidator],
      ],
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const data = {
        name: this.profileForm.value.fullName,
        phoneNumber: this.profileForm.value.phoneNumber,
      };

      this.isLoading.set(true);

      this.userAccountService.updateUser(data).subscribe({
        next: (res) => {
          localStorage.setItem('hdjeyu7830nsk083hd', JSON.stringify(res));
          this.isLoading.set(false);
          this.toastService.showToast({
            type: 'success',
            message: 'Profile updated!',
          });
          this.cancelEdit.emit();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastService.showToast({
            type: 'error',
            message: err.error.message,
          });
          console.log(err);
        },
      });
    }
  }

  isInvalidAndTouched(controlName: string) {
    const control = this.profileForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}