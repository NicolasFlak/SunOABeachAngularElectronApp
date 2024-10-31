import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {User, UserForm, UserHttp} from "../../models/user.models";
import {firstValueFrom, map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrlApi: string = environment.API_URL;

  // IMPORTANT: Modifier selon le nom du dossier(de la ressource) pour faire correspondre au chemin du back(dans le @RequestMapping)
  private resourceName: string = 'users'

  private fullBaseUrlApi: string

  constructor(private http: HttpClient, private authService: AuthService) {
    this.fullBaseUrlApi = this.baseUrlApi + this.resourceName  // 'localhost:8080/api/' + 'users'
  }

  getAll(): Promise<User[]> {
    const obsHttp$ = this.http
      .get<UserHttp[]>(`${this.fullBaseUrlApi}/`) //, options
      .pipe( // transforme les données Java en données front
        map((usersHttp: UserHttp[]) => usersHttp.map((userHttp: UserHttp) => User.mapperUserHttpToUser(userHttp)))
      )
    return firstValueFrom(obsHttp$) // toPromise
  }

  getById(id: number): Promise<User> {
    const obsHttp$ = this.http
      .get<UserHttp>(`${this.fullBaseUrlApi}/${id}`) // c'est un flux //, options
      .pipe( // transforme les données Java en données front // c'est un observable, mais comme il faut subscribe et unsubscribe, on préfère le transformer en promise juste en-dessous avec firstValueFrom() // Dans votre code, vous utilisez firstValueFrom(obsHttp$) pour transformer l'Observable en Promise. Cela vous permet de traiter le résultat d'une opération asynchrone (dans ce cas, une requête HTTP) sans avoir à gérer les abonnements et désabonnements manuellement.
        map((userHttp: UserHttp) => User.mapperUserHttpToUser(userHttp))
      )
    return firstValueFrom(obsHttp$) // toPromise: on transforme l'observable en promesse
  }

  add(userToAdd: UserForm): Promise<any> {
    const obsHttp$ = this.http
      .post(`${this.fullBaseUrlApi}/`, userToAdd) //, options
    return firstValueFrom(obsHttp$) // toPromise
  }

  edit(id: number, userEdited: UserForm): Promise<any> {
    const obsHttp$ = this.http
      .put(`${this.fullBaseUrlApi}/${id}`, userEdited) //, options
    return firstValueFrom(obsHttp$) // toPromise
  }

  deleteById(id: number): Promise<any> {
    const obsHttp$ = this.http
      .delete(`${this.fullBaseUrlApi}/${id}`)
    return firstValueFrom(obsHttp$) // toPromise
  }

}
