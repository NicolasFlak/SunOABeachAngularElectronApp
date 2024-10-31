import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../services/user/user.service";
import {User, UserForm} from "../../../models/user.models";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject, combineLatest, debounceTime, map, Observable} from "rxjs";
// import Country = User.Country;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  // Pour pouvoir avoir accès à Country dans le html:
  // countries = Country

  //On récupère la promesse du Userservice
  users$?: Observable<User[]>
  selectedUserDeleteConfirmation?: User
  showDeleteSuccessToast: boolean = false
  selectedUserForEdition?: User
  userForm?: FormGroup

  private searchFilterText$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined)

  constructor(private userService: UserService, private modalService: NgbModal, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    // this.users$ = this.userService.getAll()
    this.users$ = this.getUsersFiltered()
  }

  onInputSearchFilter(evt: any): void {
    const searchText= evt.target.value
    this.searchFilterText$.next(searchText)

    console.log(evt)
    // return
  }

  onClickAddUser(modalUserForm: any): void {
    this.initUserForm()

    const modal = this.modalService.open(modalUserForm)

    modal.result
      .then(() => {
        const userForm: UserForm = {
          // Technique 1 fastidieuse
          // email: this.userForm?.value.email,
          // firstname: this.userForm?.value.firstname,
          // lastname: this.userForm?.value.lastname,
          // password: this.userForm?.value.password,
          // country: 'France',
          // roles: [{ id: 1}]
          // }
          // OU

          // Technique 2 avec destructuration
          ...this.userForm?.value, // on prend les values du userForm et on récupère les values correspondantes du user. Les clés du userForm doivent avoir le même nom que les attributs du User
          username: 'monUsername',
          roles: [ {id: 1} ]
        }
        console.log(userForm)

        this.userService.add(userForm)
          .then( () => {
            // this.users$ = this.userService.getAll()
            this.users$ = this.getUsersFiltered()
          })
      })
      .catch(() => {
      })
  }

  onClickEditUser(modalUserForm: any, userToEdit: User): void {
    this.initUserForm(userToEdit)
    this.selectedUserForEdition = userToEdit

    const modal = this.modalService.open(modalUserForm)

    modal.result
      .then(() => {

        const userForm: UserForm = {
          ...this.userForm?.value,
          username: 'monUsername',
          roles: [ {id: 1} ],
          commands: [ ]
        }
        console.log(userForm)

        this.userService
          .edit(userToEdit.id, userForm)
          .then( () => {
            // this.users$ = this.userService.getAll()
            this.users$ = this.getUsersFiltered()
            this.selectedUserForEdition = undefined
          })

      })
      .catch(() => {
        this.selectedUserForEdition = undefined
      })
  }

  onSubmitUserForm(modal: any) {
    // On checke si le form est valide
    // Si oui, on ne fait rien
    // Sinon, on soumet le form
    if(this.userForm?.valid){
      modal.close()
    }
  }

  onClickDeleteUser(modalDeleteUser: any, user: User) {
    this.selectedUserDeleteConfirmation = user

    const modal = this.modalService.open(modalDeleteUser)

    modal.result
      .then(() => {
        this.userService
          .deleteById(user.id)
          .then(() => {
            // this.users$ = this.userService.getAll()
            this.users$ = this.getUsersFiltered()
          })
        this.showDeleteSuccessToast = true
      })
      .catch(() => {
      })

  }

  private initUserForm(userToEdit? : User): void {
    // un group est un ensemble de controles
    // un control est lié à un champs html (input par exemple)
    // un control possède un tableau de 2 index
    // - index 0 : la valeur par défaut
    // - index 1 : les validators (array)
    // chaque variable(email, firstname, etc...) est reliée à un formControlName dans le html
     this.userForm = this.fb.group( {
       email: [ userToEdit ? userToEdit.email : undefined, [Validators.required, Validators.email, Validators.minLength(6)] ],
       firstname: [ userToEdit ? userToEdit.firstname : undefined, [Validators.required] ],
       lastname: [ userToEdit ? userToEdit.lastname : undefined, [Validators.required] ],
       password: [ undefined, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':",.<>\/?]).{8,}$/) ] ], // Si on veut rajouter un pattern pour le mot de passe (1 lettre, 1 majuscule, 1 chiffre et 1 caractère spécial minimum) : rajouter Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':",.<>\/?]).{8,}$/)
       // country: [userToEdit ? userToEdit.country : Country.FRANCE, [Validators.required] ]
     } )
  }

  private getUsersFiltered(): Observable<User[]> {
    return combineLatest([
      this.userService.getAll(),
      this.searchFilterText$
    ])
      .pipe(
        debounceTime(500), //timer pendant la saisie pour ne pas envoyer de requête à chaque lettre tapée
        map(([users, searchText]) => {
          if(searchText) {
            return users.filter(u => u.firstname.toLowerCase().includes(searchText.toLowerCase()) || u.lastname.toLowerCase().includes(searchText.toLowerCase()))
          }
          return users
        })
      )
  }



}
