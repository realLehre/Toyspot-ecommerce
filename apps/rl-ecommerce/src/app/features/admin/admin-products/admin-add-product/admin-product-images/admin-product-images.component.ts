import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DragAndDropDirective } from '../../../../../shared/directives/drag-and-drop.directive';
import { IProductImages } from '../../admin-product.interface';
import { PhotoUploadService } from './services/photo-upload.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { LoaderComponent } from '../../../../../shared/components/loader/loader.component';
import { IProduct } from '../../../../products/model/product.interface';

@Component({
  selector: 'app-admin-product-images',
  standalone: true,
  imports: [DragAndDropDirective, LoaderComponent],
  templateUrl: './admin-product-images.component.html',
  styleUrl: './admin-product-images.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductImagesComponent implements OnInit {
  private photoUploadService = inject(PhotoUploadService);
  uploadBoxes = signal<IProductImages[]>([]);
  coverImage = signal<IProductImages>({
    hasUploaded: false,
    isUploading: false,
    selectedFile: null,
    imageUrl: '',
  });
  imageUrls: string[] = [];
  coverImageUrl!: string;
  imageUrlsEmit = output<{ imageUrls: string[]; coverImageUrl: string }>();
  previousImageUrl!: string | null;
  productData = input<IProduct | undefined>(undefined);
  uploadError = signal<boolean[]>([]);
  coverImageUploadError = signal<boolean>(false);
  imageUploading = computed(() => {
    return (
      this.coverImage().isUploading ||
      this.uploadBoxes().some((box) => box.isUploading)
    );
  });
  imageUploadStatus = output<boolean>();

  ngOnInit() {
    const boxes = Array(1)
      .fill(null)
      .map(() => ({
        hasUploaded: false,
        isUploading: false,
        selectedFile: null,
        imageUrl: '',
      }));
    this.uploadBoxes.set(boxes);

    if (this.productData()) {
      this.coverImage.set({
        ...this.coverImage(),
        hasUploaded: true,
        imageUrl: this.productData()?.image!,
      });
      this.coverImageUrl = this.productData()?.image!;

      this.uploadBoxes.set(
        this.photoUploadService.prefillUploadBoxes(
          this.productData()?.imageUrls as string[],
        ),
      );
      const imageUrls = [...this.productData()?.imageUrls!];
      this.imageUrls = imageUrls.slice(1);
    }
  }

  fileBrowseHandler(event: any, type: string, index?: number) {
    const file = event.target.files[0];
    if (type === 'multiple') {
      this.processFile(file, 'multiple', index);
    } else {
      this.processFile(file, 'single');
    }
  }

  onFileDropped(event: any, type: string, index?: number) {
    if (type === 'multiple') {
      if (this.uploadBoxes()[index!].isUploading) {
        return;
      }
      this.processFile(event[0], 'multiple', index);
    } else {
      if (this.coverImage().isUploading) {
        return;
      }
      this.processFile(event[0], 'single');
    }
  }

  processFile(file: File, type: string, index?: number) {
    // Validate file type and size
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/avif',
        'image/webp',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, AVIF, WEBP images are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size cannot exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (type == 'multiple') {
          this.updateUploadBox(index!, file, reader.result as string, true);
          this.previousImageUrl = this.imageUrls[index!];
          const errors = this.uploadError();
          errors[index!] = false;
          this.uploadError.set(errors);
        } else {
          this.coverImage.set({
            hasUploaded: true,
            isUploading: true,
            selectedFile: file,
            imageUrl: reader.result as string,
          });
          this.previousImageUrl = this.coverImageUrl;
          this.coverImageUploadError.set(false);
        }
        this.imageUploadStatus.emit(this.imageUploading());
      };
      this.uploadFile(file, type, index);
      reader.readAsDataURL(file);
    }
  }

  updateUploadBox(
    index: number,
    file: File,
    imageUrl: string,
    isUploading: boolean,
  ) {
    const boxes = [...this.uploadBoxes()];
    boxes[index] = {
      hasUploaded: true,
      isUploading,
      selectedFile: file,
      imageUrl: imageUrl,
    };
    this.uploadBoxes.set(boxes);
  }

  removeImage(index: number) {
    const boxes = [...this.uploadBoxes()];
    boxes[index] = {
      hasUploaded: false,
      isUploading: false,
      selectedFile: null,
      imageUrl: '',
    };
    this.uploadBoxes.set(boxes);
    this.imageUrls[index] = '';
    this.imageUrlsEmit.emit({
      imageUrls: this.imageUrls,
      coverImageUrl: this.coverImageUrl,
    });
  }

  removeCoverImage() {
    this.coverImage.set({
      hasUploaded: false,
      isUploading: false,
      selectedFile: null,
      imageUrl: '',
    });
    this.coverImageUrl = '';
    this.imageUrlsEmit.emit({
      imageUrls: this.imageUrls,
      coverImageUrl: this.coverImageUrl,
    });
  }

  uploadFile(file: File, type?: string, index?: number) {
    const filePath = file.name;
    this.photoUploadService
      .upLoadImage(filePath, file)
      .pipe(
        switchMap((res) => this.photoUploadService.getImageUrl(res.data.path)),
        catchError((err: any) => {
          this.setBoxesOnError(type, index);
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: (res) => {
          if (type == 'multiple') {
            this.imageUrls[index!] = res;
            const boxes = [...this.uploadBoxes()];
            boxes[index!] = {
              ...boxes[index!],
              isUploading: false,
            };
            this.uploadBoxes.set(boxes);
          } else {
            this.coverImageUrl = res;
            this.coverImage.set({
              ...this.coverImage(),
              isUploading: false,
            });
          }
          this.imageUrlsEmit.emit({
            imageUrls: this.imageUrls,
            coverImageUrl: this.coverImageUrl,
          });
          this.imageUploadStatus.emit(this.imageUploading());
          if (this.previousImageUrl) {
            this.photoUploadService
              .removeImage(this.previousImageUrl)
              .subscribe((res) => {
                this.previousImageUrl = null;
              });
          }
        },
        error: (err) => {
          this.setBoxesOnError(type, index);
        },
      });
  }

  onAddNewUploadBox() {
    this.uploadBoxes.set([
      ...this.uploadBoxes(),
      {
        hasUploaded: false,
        isUploading: false,
        selectedFile: null,
        imageUrl: '',
      },
    ]);
  }

  setBoxesOnError(type?: string, index?: number) {
    if (type == 'multiple') {
      const boxes = [...this.uploadBoxes()];
      boxes[index!] = {
        ...boxes[index!],
        isUploading: false,
        imageUrl: '',
      };
      this.uploadBoxes.set(boxes);
      const errors = this.uploadError();
      errors[index!] = true;
      this.uploadError.set(errors);
    } else {
      this.coverImage.set({
        ...this.coverImage(),
        isUploading: false,
        imageUrl: '',
      });
      this.coverImageUrl = '';
      this.coverImageUploadError.set(true);
    }
    this.imageUploadStatus.emit(this.imageUploading());
  }
}
