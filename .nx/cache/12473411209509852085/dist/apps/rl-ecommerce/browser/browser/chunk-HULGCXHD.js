import{a as l,b as S,c}from"./chunk-JMTCKGXD.js";import{c as u}from"./chunk-BLPDBI5E.js";import{M as h,R as o,X as s,ab as n,j as a}from"./chunk-RY22DRUR.js";var O=(()=>{let e=class e{constructor(){this.authService=s(c),this.cookieService=s(S),this.http=s(u),this.user=this.authService.user,this.baseUrl=l.apiUrl,this.userSignal=n(null),this.USER_ACCOUNT_STORAGE_KEY="hdjeyu7830nsk083hd";let t=JSON.parse(localStorage.getItem(this.USER_ACCOUNT_STORAGE_KEY));t?this.userSignal.set(t):this.userSignal.set(null)}testEndPoint(){}getUser(){return this.userSignal()?a(this.userSignal()):this.http.get(`${this.baseUrl}users/${this.user()?.id}`).pipe(h(t=>{this.setUser(t)}))}updateUser(t){return this.http.patch(`${this.baseUrl}users/${this.user()?.id}`,t).pipe(h(i=>{this.setUser(i)}))}setUser(t){this.userSignal.set(t),localStorage.setItem(this.USER_ACCOUNT_STORAGE_KEY,JSON.stringify(t));let i={email:t?.email,phoneNumber:t?.phoneNumber,id:t?.id,fullName:t?.name};this.authService.user.set(i),this.cookieService.set(this.authService.USER_STORAGE_KEY,JSON.stringify(i),{path:"/",secure:!0,sameSite:"Strict"})}};e.\u0275fac=function(i){return new(i||e)},e.\u0275prov=o({token:e,factory:e.\u0275fac,providedIn:"root"});let r=e;return r})();export{O as a};