package com.gestion.controller;

import com.gestion.dto.ProjetDTO;
import com.gestion.entity.Projet;
import com.gestion.mapper.ProjetMapper;
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

@RestController
@RequestMapping("/api/admin/projets")
@PreAuthorize("hasRole('ADMIN')")
public class ProjetController {

    private final ProjetService projetService;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }

    @GetMapping
    public ResponseEntity<List<ProjetDTO>> getAllProjets() {
        return ResponseEntity.ok(
                projetService.findAll().stream()
                        .map(ProjetMapper::toDTO)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetDTO> getProjet(@PathVariable Long id) {
        return ResponseEntity.ok(ProjetMapper.toDTO(projetService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ProjetDTO> createProjet(@RequestBody Projet projet) {
        return ResponseEntity.ok(ProjetMapper.toDTO(projetService.create(projet)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjetDTO> updateProjet(@PathVariable Long id, @RequestBody Projet projet) {
        return ResponseEntity.ok(ProjetMapper.toDTO(projetService.update(id, projet)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long id) {
        projetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
