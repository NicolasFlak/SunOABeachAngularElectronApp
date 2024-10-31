import {Component, OnInit} from '@angular/core';
import {faHouse, faUser} from "@fortawesome/free-solid-svg-icons";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {map, Observable} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // isConnected: boolean = false
  isConnected$?: Observable<boolean>

  iconHome: IconDefinition = faHouse
  iconSignOut: IconDefinition = faUser

  // exécuté une seule fois, à la création du composant
  constructor(private authService: AuthService, private router: Router) {
  }

  // exécuté à chaque fois que le composant est affiché
  ngOnInit(): void {
    //Solution 1 :
    // const cbExecutedEachTimeNewTokenNexted = (token: string | undefined) => {
    //   this.isConnected = Boolean(token)
    // }
    //
    // this.authService
    //   .token$
    //   .subscribe(cbExecutedEachTimeNewTokenNexted) // attend en paramètre une fonction callback qui se jouera à chaque fois qu'un nouveau token sera nexté (exécuté)

    // Solution 2:
    // this.authService
    //   .token$
    //   .subscribe((token: string | undefined) => this.isConnected = Boolean(token))

    // Solution 3:
    //Opérer une transformation d'une string vers un boolean
    this.isConnected$ = this.authService
      .token$
      .pipe(
        map( (token: string | undefined) => Boolean(token) )
      )

  }

  onClickSignOut(){
    this.authService.signOut()
    this.router.navigateByUrl('auth/signin')
  }

}
