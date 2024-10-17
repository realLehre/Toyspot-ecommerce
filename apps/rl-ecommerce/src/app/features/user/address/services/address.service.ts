import { inject, Injectable } from '@angular/core';
import { IAddress } from '../../models/address.interface';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CreateAddressDto } from '../../../../../../../api/src/app/api-address/create-address.dto';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  baseUrl = environment.apiUrl;
  authService = inject(AuthService);
  private http = inject(HttpClient);
  addresses: IAddress[] = [
    {
      name: 'David Omolere Egbuwalo',
      city: 'Ile Ife',
      state: 'Osun',
      phoneNumber: '+234 9131778206',
      isDefault: true,
    },
    {
      name: 'Jane Doe',
      city: 'Lagos',
      state: 'Lagos',
      phoneNumber: '+234 9131778206',
      isDefault: false,
    },
    {
      name: 'John Smith',
      city: 'Abuja',
      state: 'FCT',
      phoneNumber: '+234 9131778206',
      isDefault: false,
    },
  ];
  constructor() {}

  getAddress(): Observable<{
    addresses: IAddress[];
  }> {
    return this.http.get<{
      addresses: IAddress[];
    }>(`${this.baseUrl}users/${this.authService.user()?.id}/address`);
  }

  addAddress(data: CreateAddressDto) {
    return this.http.post(
      `${this.baseUrl}users/${this.authService.user()?.id}/address`,
      data,
    );
  }

  phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const validPhoneNumberPattern = /^[0-9+-]*$/;

    if (value && !validPhoneNumberPattern.test(value)) {
      return { invalidPhoneNumber: true }; // Invalid phone number
    }
    return null; // Valid phone number
  }

  getLocationInfo(place: any[]) {
    const placeResult = { city: '', state: '', country: '' };
    place.forEach((component: any) => {
      const componentType = component.types[0];

      if (componentType === 'locality') {
        placeResult['city'] = component.long_name; // City
      } else if (componentType === 'administrative_area_level_1') {
        placeResult['state'] = component.long_name; // Region/State
      } else if (componentType == 'country') {
        placeResult['country'] = component.long_name;
      }
    });
    return placeResult;
  }
}
