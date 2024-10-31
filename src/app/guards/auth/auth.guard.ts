import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from "../../services/auth/auth.service";
import {inject} from "@angular/core";

// Sera utilisé pour "garder" les routes dans le app-routing
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const isConnected = Boolean(authService.token)

  if(isConnected) {
    return true;
  } else {
    return router.navigateByUrl('/auth/signin')
  }
};
