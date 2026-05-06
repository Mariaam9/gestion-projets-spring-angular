package com.gestion.controller;

import com.gestion.config.JwtUtil;
import com.gestion.dto.AffectationDTO;
import com.gestion.dto.EmployeResponseDTO;
import com.gestion.dto.ProjetDTO;
import com.gestion.entity.Employe;
import com.gestion.entity.Projet;
import com.gestion.service.AffectationService;
import com.gestion.service.EmployeService;
import com.gestion.service.ProjetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employe")
@PreAuthorize("hasAnyRole('EMPLOYE', 'ADMIN')")
public class EmployeEspaceController {

    private final ProjetService projetService;
    private final AffectationService affectationService;
    private final EmployeService employeService;
    private final JwtUtil jwtUtil;

    public EmployeEspaceController(ProjetService projetService,
                                   AffectationService affectationService,
                                   EmployeService employeService,
                                   JwtUtil jwtUtil) {
        this.projetService = projetService;
        this.affectationService = affectationService;
        this.employeService = employeService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/projets")
    public ResponseEntity<List<ProjetDTO>> getAllProjets() {
        return ResponseEntity.ok(
                projetService.findAll().stream()
                        .map(this::toProjetDTO)
                        .toList()
        );
    }

    @GetMapping("/projets/{projetId}/employes")
    public ResponseEntity<List<AffectationDTO>> getEmployesByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(affectationService.findByProjet(projetId));
    }

    @GetMapping("/mes-projets")
    public ResponseEntity<List<AffectationDTO>> mesAffectations(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(affectationService.findByEmploye(userId));
    }

    @GetMapping("/profil")
    public ResponseEntity<EmployeResponseDTO> getProfil(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(toEmployeResponseDTO(employeService.findById(userId)));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    private ProjetDTO toProjetDTO(Projet projet) {
        ProjetDTO dto = new ProjetDTO();
        dto.setId(projet.getId());
        dto.setNom(projet.getNom());
        dto.setDescription(projet.getDescription());
        dto.setDateDebut(projet.getDateDebut());
        dto.setDateFin(projet.getDateFin());
        return dto;
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
}
