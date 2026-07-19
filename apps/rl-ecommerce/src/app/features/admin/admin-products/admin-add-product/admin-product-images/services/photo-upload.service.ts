import { inject, Injectable, signal } from '@angular/core';
import { defer, from, map, mergeMap, Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../../../../auth/services/auth.service';
import { IProductImages } from '../../../admin-product.interface';

@Injectable({
  providedIn: 'root',
})
export class PhotoUploadService {
  private readonly authService = inject(AuthService);
  private supabase = this.authService.supabase;
  BUCKET_NAME = 'just-product-images';

  constructor() {}

  upLoadImage(
    filePath: string,
    file: File,
  ): Observable<{
    data: { id: string; path: string; fullPath: string };
    error: any;
  }> {
    const fileName = uuidv4() + '-' + file.name;
    return defer(
      (): Observable<any> =>
        from(
          this.supabase.storage.from(this.BUCKET_NAME).upload(fileName, file),
        ),
    );
  }

  getImageUrl(filePath: string): Observable<string> {
    const { data } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return of(data.publicUrl);
    // return defer(() =>
    //   from(
    //     this.supabase.storage
    //       .from(this.BUCKET_NAME)
    //       .getPublicUrl(filePath)
    //   ),
    // ).pipe(map(({ data }) => data));
  }

  removeImage(imageUrl: string): Observable<any> {
    const imagePath = this.getImagePath(imageUrl);
    return defer(() =>
      from(this.supabase.storage.from(this.BUCKET_NAME).remove([imagePath])),
    );
  }

  deleteAllImagesFromBucket(imageUrls: string[]): void {
    from(imageUrls)
      .pipe(mergeMap((url) => this.removeImage(this.getImagePath(url))))
      .subscribe({
        next: (res) => {},
        error: (err) => {},
      });
  }

  getImagePath(url: string): string {
    const basePath = url.split('?')[0];
    return basePath.split('/').pop()!;
  }

  prefillUploadBoxes(data: string[]): IProductImages[] {
    const uploadBoxes = [];

    for (let v = 0; v < data.length; v++) {
      if (v > 0 && data.length > 1) {
        uploadBoxes.push({
          hasUploaded: true,
          isUploading: false,
          selectedFile: null,
          imageUrl: data[v],
        });
      }
    }
    return uploadBoxes as IProductImages[];
  }
}
