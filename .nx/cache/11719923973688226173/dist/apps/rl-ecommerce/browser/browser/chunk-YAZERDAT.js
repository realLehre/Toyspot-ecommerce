import{a as p}from"./chunk-JMTCKGXD.js";import{c as l}from"./chunk-BLPDBI5E.js";import{M as c,R as a,X as o,ab as i,ca as u,j as n}from"./chunk-RY22DRUR.js";var h=(()=>{let r=class r{constructor(){this.http=o(l),this.categoriesSignal=i(null),this.currentCategory=i(null),this.currentSubCategory=i(null),this.currentPage=i(1),this.currentPriceFilter=i(null),this.currentSort=i(null),this.url=p.apiUrl+"category";let t=JSON.parse(sessionStorage.getItem("hshs82haa02sshs92s"));t?.category&&this.currentCategory.set(t.category),t?.subCategory&&this.currentSubCategory.set(t.subCategory),t?.page&&this.currentPage.set(t.page),t?.price&&this.currentPriceFilter.set({min:t?.price.min,max:t?.price.max}),t?.sort&&this.currentSort.set(t?.sort)}getCategories(){return this.categoriesSignal()?n(this.categoriesSignal()):this.http.get(`${this.url}`).pipe(c(t=>this.categoriesSignal.set(t)))}createSlug(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}checkNumberOfFiltersApplied(){let t=this.currentPriceFilter(),s=this.currentSort();return t&&s?2:t||s?1:0}};r.\u0275fac=function(s){return new(s||r)},r.\u0275prov=a({token:r,factory:r.\u0275fac,providedIn:"root"});let e=r;return e})();var P=(()=>{let r=class r{constructor(){this.optionsService=o(h)}transform(t){return this.optionsService.checkNumberOfFiltersApplied()}};r.\u0275fac=function(s){return new(s||r)},r.\u0275pipe=u({name:"numberOfFilters",type:r,pure:!0,standalone:!0});let e=r;return e})();export{h as a,P as b};
