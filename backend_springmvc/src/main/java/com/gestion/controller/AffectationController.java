package com.gestion.controller;

import com.gestion.dto.AffectationDTO;
import com.gestion.service.AffectationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/affectations")
@PreAuthorize("hasRole('ADMIN')")
public class AffectationController {

    private final AffectationService affectationService;

    public AffectationController(AffectationService affectationService) {
        this.affectationService = affectationService;
    }

    @GetMapping
    public ResponseEntity<List<AffectationDTO>> getAllAffectations() {
        return ResponseEntity.ok(affectationService.findAll());
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<AffectationDTO>> getByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(affectationService.findByProjet(projetId));
    }

    @PostMapping
    public ResponseEntity<AffectationDTO> createAffectation(@RequestBody AffectationDTO dto) {
        return ResponseEntity.ok(affectationService.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAffectation(@PathVariable Long id) {
        affectationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
