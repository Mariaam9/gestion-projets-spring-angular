package com.gestion.controller;

import com.gestion.dto.AffectationDTO;
import com.gestion.dto.CategorieDTO;
import com.gestion.dto.EmployeDTO;
import com.gestion.dto.EmployeResponseDTO;
import com.gestion.dto.ProjetDTO;
import com.gestion.entity.Categorie;
import com.gestion.entity.Employe;
import com.gestion.entity.Projet;
import com.gestion.service.AffectationService;
import com.gestion.service.CategorieService;
import com.gestion.service.EmployeService;
import com.gestion.service.ProjetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final EmployeService employeService;
    private final CategorieService categorieService;
    private final ProjetService projetService;
    private final AffectationService affectationService;

    public AdminController(EmployeService employeService,
                           CategorieService categorieService,
                           ProjetService projetService,
                           AffectationService affectationService) {
        this.employeService = employeService;
        this.categorieService = categorieService;
        this.projetService = projetService;
        this.affectationService = affectationService;
    }

    // ===== EMPLOYES =====
    // DTO de sortie pour eviter la serialisation directe des entites JPA
    // et les cycles JSON: Employe -> Categorie -> Employes -> Employe.
    @GetMapping("/employes")
    public ResponseEntity<List<EmployeResponseDTO>> getAllEmployes() {
        return ResponseEntity.ok(
                employeService.findAll().stream()
                        .map(this::toEmployeResponseDTO)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/employes/{id}")
    public ResponseEntity<EmployeResponseDTO> getEmploye(@PathVariable Long id) {
        return ResponseEntity.ok(toEmployeResponseDTO(employeService.findById(id)));
    }

    @PostMapping("/employes")
    public ResponseEntity<EmployeResponseDTO> createEmploye(@RequestBody EmployeDTO dto) {
        return ResponseEntity.ok(toEmployeResponseDTO(employeService.create(dto)));
    }

    @PutMapping("/employes/{id}")
    public ResponseEntity<EmployeResponseDTO> updateEmploye(@PathVariable Long id, @RequestBody EmployeDTO dto) {
        return ResponseEntity.ok(toEmployeResponseDTO(employeService.update(id, dto)));
    }

    @DeleteMapping("/employes/{id}")
    public ResponseEntity<Void> deleteEmploye(@PathVariable Long id) {
        employeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===== CATEGORIES =====
    @GetMapping("/categories")
    public ResponseEntity<List<CategorieDTO>> getAllCategories() {
        return ResponseEntity.ok(
                categorieService.findAll().stream()
                        .map(this::toCategorieDTO)
                        .collect(Collectors.toList())
        );
    }

    @PostMapping("/categories")
    public ResponseEntity<CategorieDTO> createCategorie(@RequestBody Categorie categorie) {
        return ResponseEntity.ok(toCategorieDTO(categorieService.create(categorie)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategorieDTO> updateCategorie(@PathVariable Long id, @RequestBody Categorie categorie) {
        return ResponseEntity.ok(toCategorieDTO(categorieService.update(id, categorie)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        categorieService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===== PROJETS =====
    @GetMapping("/projets")
    public ResponseEntity<List<ProjetDTO>> getAllProjets() {
        return ResponseEntity.ok(
                projetService.findAll().stream()
                        .map(this::toProjetDTO)
                        .collect(Collectors.toList())
        );
    }

    @PostMapping("/projets")
    public ResponseEntity<ProjetDTO> createProjet(@RequestBody Projet projet) {
        return ResponseEntity.ok(toProjetDTO(projetService.create(projet)));
    }

    @PutMapping("/projets/{id}")
    public ResponseEntity<ProjetDTO> updateProjet(@PathVariable Long id, @RequestBody Projet projet) {
        return ResponseEntity.ok(toProjetDTO(projetService.update(id, projet)));
    }

    @DeleteMapping("/projets/{id}")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long id) {
        projetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===== AFFECTATIONS =====
    @GetMapping("/affectations")
    public ResponseEntity<List<AffectationDTO>> getAllAffectations() {
        return ResponseEntity.ok(affectationService.findAll());
    }

    @GetMapping("/affectations/projet/{projetId}")
    public ResponseEntity<List<AffectationDTO>> getByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(affectationService.findByProjet(projetId));
    }

    @PostMapping("/affectations")
    public ResponseEntity<AffectationDTO> createAffectation(@RequestBody AffectationDTO dto) {
        return ResponseEntity.ok(affectationService.create(dto));
    }

    @DeleteMapping("/affectations/{id}")
    public ResponseEntity<Void> deleteAffectation(@PathVariable Long id) {
        affectationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private EmployeResponseDTO toEmployeResponseDTO(Employe employe) {
        EmployeResponseDTO dto = new EmployeResponseDTO();
        dto.setId(employe.getId());
        dto.setNom(employe.getNom());
        dto.setPrenom(employe.getPrenom());
        dto.setEmail(employe.getEmail());
        dto.setRole(employe.getRole());
        dto.setMatricule(employe.getMatricule());

        if (employe.getCategorie() != null) {
            dto.setCategorieId(employe.getCategorie().getId());
            dto.setCategorieNom(employe.getCategorie().getNom());
        }

        return dto;
    }

    private CategorieDTO toCategorieDTO(Categorie categorie) {
        return new CategorieDTO(categorie.getId(), categorie.getNom(), categorie.getDescription());
    }

    private ProjetDTO toProjetDTO(Projet projet) {
        return new ProjetDTO(
                projet.getId(),
                projet.getNom(),
                projet.getDescription(),
                projet.getDateDebut(),
                projet.getDateFin()
        );
    }
}
