import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, firstValueFrom, Observable} from "rxjs";
import {LocalStorageManagerService} from "../local-storage-manager/local-storage-manager.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //Subject c'est des flux que l'on peut observer et sur lesquels on peut subscribe (s'enregistrer / souscrire)

  // 3 types:
  // -Subject: pipe dans lequel transite l'info
  // -BehaviorSubject : subject + conserve la dernière valeur qui a été envoyée dans le piep (getter pour récup la dernière donnée)
  // -ReplaySubject: beahaviorSubject + un historique variable (entre 1 et X valeurs dans l'historique)

  // Observable vs Subject
  // Subject => lecture + écriture
  // Observable => écriture

  //Permet la lecture ET l'écriture
  private internalToken$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined)

  // Permet uniquement la lecture
  token$: Observable<string | undefined> = this.internalToken$.asObservable()

  private baseUrlApi: string = environment.API_URL;
  private resourceName: string = 'security'

  private fullBaseUrlApi: string

  constructor(private http: HttpClient, private localStorageManagerService: LocalStorageManagerService) {
    this.fullBaseUrlApi = this.baseUrlApi + this.resourceName  // 'localhost:8080/api/' + 'security'
    const token = this.localStorageManagerService.getData(environment.LOCAL_STORAGE.TOKEN)
    this.internalToken$.next(token)
  }

  // Return la dernière value nextée dans le subject
  get token(): string | undefined {
    return this.internalToken$.value
  }

  signIn(username: string, password: string, keepConnection: boolean): Promise<void | string> {
    const observableHttp$ = this.http.post<{ token: string }>(`${this.fullBaseUrlApi}/auth`, {username, password})  // 'localhost:8080/api/' + 'security' + '/auth'
    // on met un $ à la fin du nom pour reconnaitre qu'on est sur un observable
    return firstValueFrom(observableHttp$) // transforme un observable en promesse
      .then((res: { token: string }) => {
        this.internalToken$.next(res.token)

        console.log(keepConnection)

        if (keepConnection) {// si on coche 'remember me', on envoie un token pour save la data
          this.localStorageManagerService.saveData(environment.LOCAL_STORAGE.TOKEN, res.token)
        }
      })
  }

  signOut() {
    this.internalToken$.next(undefined)
    this.localStorageManagerService.removeData(environment.LOCAL_STORAGE.TOKEN)
  }
}
