import { Component } from '@angular/core';
import { FeaturedProductComponent } from '../product-options/featured-product/featured-product.component';
import { CategoriesComponent } from '../product-options/categories/categories.component';
import { FiltersComponent } from '../product-options/filters/filters.component';
import { ProductNavComponent } from './product-nav/product-nav.component';
import { ProductsShowcaseComponent } from '../products-showcase/products-showcase.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CategoriesComponent,
    FiltersComponent,
    ProductNavComponent,
    ProductsShowcaseComponent,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  videoUrl =
    'https://spopvwzperdnuiatnbtd.supabase.co/storage/v1/object/sign/app-images/hero-video-compressed-medium.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMWQ3YjY3Yi03MzRkLTQzNDgtYTZkNC00NTVhMTZhZjI1MzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAtaW1hZ2VzL2hlcm8tdmlkZW8tY29tcHJlc3NlZC1tZWRpdW0ubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDQyOTUzMiwiZXhwIjoyMDk5Nzg5NTMyfQ.z7DUyL2wCkQIwAIN84DdXbRs1GMYenHmUjor5EKSRWo';
  thumbnailUrl =
    'https://spopvwzperdnuiatnbtd.supabase.co/storage/v1/object/sign/app-images/hero-video-compressed.mp4_20250108_032828.382.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMWQ3YjY3Yi03MzRkLTQzNDgtYTZkNC00NTVhMTZhZjI1MzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAtaW1hZ2VzL2hlcm8tdmlkZW8tY29tcHJlc3NlZC5tcDRfMjAyNTAxMDhfMDMyODI4LjM4Mi5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NDI5NTg3LCJleHAiOjIwOTk3ODk1ODd9.kIwZ_pgyejh0qbJUYTysrytChE-liXnFpaunbW1JBwk';
}
