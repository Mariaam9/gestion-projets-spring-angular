# Gestion de Projets - Spring Boot / Angular

Application web de gestion de projets développée avec **Spring Boot Spring MVC** côté backend et **Angular 16** côté frontend.

Le projet permet à un administrateur de gérer les employés, les catégories, les projets et les affectations des employés aux projets.  
Un employé peut se connecter pour consulter ses projets affectés ainsi que les collaborateurs associés à chaque projet.

---

## Technologies utilisées

### Backend

- Java
- Spring Boot
- Spring MVC / REST API
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL
- Maven

### Frontend

- Angular 16
- TypeScript
- HTML / CSS
- Angular Router
- HttpClient
- ng2-charts
- Chart.js

### Base de données

- MySQL via XAMPP

---

## Structure du projet

```text
gestion-projets/
├── backend_springmvc/
│   ├── pom.xml
│   ├── README_ARCHITECTURE.md
│   └── src/
│       └── main/
│           ├── java/com/gestion/
│           │   ├── config/
│           │   ├── controller/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── filter/
│           │   ├── repository/
│           │   └── service/
│           │       └── impl/
│           └── resources/
│               └── application.properties
│
├── frontend_angular/
│   ├── angular.json
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app/
│       ├── Modeles/
│       ├── Services/
│       ├── assets/
│       ├── environment.ts
│       ├── main.ts
│       └── styles.css
│
├── README.md
└── .gitignore