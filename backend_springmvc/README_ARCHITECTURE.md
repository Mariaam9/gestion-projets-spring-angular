# Backend conforme SpringMVC et Clean Architecture

Ce backend respecte une architecture en couches SpringMVC / REST :

- `controller` : couche de contrôle REST (`@RestController`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`).
- `service` : contrats métier sous forme d'interfaces.
- `service.impl` : implémentations concrètes des services annotées avec `@Service`.
- `repository` : couche DAO Spring Data JPA, interfaces héritant de `JpaRepository`.
- `entity` : modèle JPA annoté avec `@Entity`.
- `dto` : objets de transfert utilisés entre frontend et backend.

## Améliorations apportées

1. Ajout d'interfaces de service : `EmployeService`, `ProjetService`, `CategorieService`, `AffectationService`, `AuthService`.
2. Déplacement de la logique métier dans des classes `*ServiceImpl`.
3. Les contrôleurs dépendent maintenant des interfaces, ce qui assure un faible couplage.
4. Ajout de `@Transactional` dans la couche service :
   - `@Transactional(readOnly = true)` pour les lectures.
   - `@Transactional` pour les créations, modifications et suppressions.
5. Conservation de l'injection par constructeur, recommandée pour obtenir des dépendances stables et testables.

## Lancement

Configurer la base de données dans `src/main/resources/application.properties`, puis lancer :

```bash
mvn spring-boot:run
```
