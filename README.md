# Gestion de Projets — Jakarta EE (API REST + Angular + JPA + MySQL)

## Stack technique
| Couche     | Technologie                              |
|------------|------------------------------------------|
| Backend    | Spring Boot 3.4, Spring Security 6, JWT  |
| ORM        | Spring Data JPA + Hibernate              |
| Base de données | MySQL 8                            |
| Frontend   | Angular 19 (standalone components)       |
| Auth       | JWT (jjwt 0.12.6)                        |

---

## Structure du projet
```
gestion-projets/
├── backend/              ← Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/gestion/
│       ├── entity/       ← Utilisateur, Employe, Administrateur, Categorie, Projet, Affectation
│       ├── repository/   ← Interfaces JPA
│       ├── dto/          ← AuthRequest, AuthResponse, EmployeDTO, AffectationDTO
│       ├── service/      ← AuthService, EmployeService, CategorieService, ProjetService, AffectationService
│       ├── controller/   ← AuthController, AdminController, EmployeController
│       ├── config/       ← SecurityConfig, JwtUtil
│       └── filter/       ← JwtFilter
└── frontend/             ← Angular 19
    └── src/app/
        ├── models/       ← models.ts (interfaces TypeScript)
        ├── core/
        │   ├── services/ ← auth, employe, categorie, projet, affectation services
        │   ├── guards/   ← authGuard, adminGuard
        │   └── interceptors/ ← jwtInterceptor
        ├── auth/login/   ← Page de connexion
        ├── shared/navbar/← Barre de navigation latérale
        ├── admin/        ← dashboard, employes, categories, projets, affectations
        └── employe/      ← projets, equipe
```

---

## Démarrage — Backend

### 1. Prérequis
- Java 23
- Maven 3.9+
- MySQL 8 en cours d'exécution

### 2. Configurer MySQL
```sql
-- Créer la base (Spring la crée automatiquement si absente)
CREATE DATABASE IF NOT EXISTS gestion_projets;
```

Vérifier `src/main/resources/application.properties` :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gestion_projets?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root   ← Adapter selon votre config
```

### 3. Lancer le backend
```bash
cd backend
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

> **Compte admin créé automatiquement au démarrage :**
> - Email    : `admin@gestion.com`
> - Password : `admin123`

---

## Démarrage — Frontend

### 1. Installer les dépendances
```bash
cd frontend
npm install
```

### 2. Lancer le frontend
```bash
ng serve
```

L'application est disponible sur **http://localhost:4200**

---

## Endpoints API REST

### Authentification
| Méthode | URL               | Accès  | Description          |
|---------|-------------------|--------|----------------------|
| POST    | /api/auth/login   | Public | Connexion → token JWT|

### Admin (rôle ADMIN requis)
| Méthode | URL                                     | Description               |
|---------|-----------------------------------------|---------------------------|
| GET     | /api/admin/employes                     | Lister tous les employés  |
| POST    | /api/admin/employes                     | Créer un employé          |
| PUT     | /api/admin/employes/{id}                | Modifier un employé       |
| DELETE  | /api/admin/employes/{id}                | Supprimer un employé      |
| GET     | /api/admin/categories                   | Lister les catégories     |
| POST    | /api/admin/categories                   | Créer une catégorie       |
| PUT     | /api/admin/categories/{id}              | Modifier une catégorie    |
| DELETE  | /api/admin/categories/{id}              | Supprimer une catégorie   |
| GET     | /api/admin/projets                      | Lister les projets        |
| POST    | /api/admin/projets                      | Créer un projet           |
| PUT     | /api/admin/projets/{id}                 | Modifier un projet        |
| DELETE  | /api/admin/projets/{id}                 | Supprimer un projet       |
| GET     | /api/admin/affectations                 | Toutes les affectations   |
| GET     | /api/admin/affectations/projet/{id}     | Affectations par projet   |
| POST    | /api/admin/affectations                 | Créer une affectation     |
| DELETE  | /api/admin/affectations/{id}            | Supprimer une affectation |

### Employé (rôle EMPLOYE ou ADMIN)
| Méthode | URL                                        | Description                    |
|---------|--------------------------------------------|--------------------------------|
| GET     | /api/employe/projets                       | Tous les projets               |
| GET     | /api/employe/projets/{id}/employes         | Employés d'un projet           |
| GET     | /api/employe/mes-projets                   | Mes propres affectations       |
| GET     | /api/employe/profil                        | Mon profil (depuis le token)   |

---

## Héritage JPA — Stratégie JOINED

```
TABLE utilisateur (id, nom, prenom, email, password, role)
       ├── TABLE employe      (id FK, matricule, categorie_id FK)
       └── TABLE administrateur (id FK)
```

Le champ `role` dans `utilisateur` vaut :
- `EMPLOYE` pour les employés
- `ADMIN` pour les administrateurs

---

## Fonctionnalités par rôle

### Administrateur
- ✅ Authentification
- ✅ Gérer utilisateurs (CRUD employés)
- ✅ Gérer catégories (CRUD)
- ✅ Gérer projets (CRUD)
- ✅ Affecter un employé à un projet (avec dates)
- ✅ Tableau de bord avec statistiques

### Employé
- ✅ Authentification
- ✅ Lister tous les projets
- ✅ Voir ses propres affectations
- ✅ Voir l'équipe d'un projet (lister les employés par projet)
