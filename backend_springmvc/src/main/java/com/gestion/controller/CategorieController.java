package com.gestion.controller;

import com.gestion.dto.CategorieDTO;
import com.gestion.entity.Categorie;
import com.gestion.service.CategorieService;
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

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class CategorieController {

    private final CategorieService categorieService;

    public CategorieController(CategorieService categorieService) {
        this.categorieService = categorieService;
    }

    @GetMapping
    public ResponseEntity<List<CategorieDTO>> getAllCategories() {
        return ResponseEntity.ok(
                categorieService.findAll().stream()
                        .map(this::toDTO)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategorieDTO> getCategorie(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(categorieService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CategorieDTO> createCategorie(@RequestBody Categorie categorie) {
        return ResponseEntity.ok(toDTO(categorieService.create(categorie)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategorieDTO> updateCategorie(@PathVariable Long id, @RequestBody Categorie categorie) {
        return ResponseEntity.ok(toDTO(categorieService.update(id, categorie)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        categorieService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private CategorieDTO toDTO(Categorie categorie) {
        CategorieDTO dto = new CategorieDTO();
        dto.setId(categorie.getId());
        dto.setNom(categorie.getNom());
        dto.setDescription(categorie.getDescription());
        return dto;
    }
}
