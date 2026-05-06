package com.gestion.controller;

import com.gestion.config.JwtUtil;
import com.gestion.dto.AffectationDTO;
import com.gestion.dto.EmployeResponseDTO;
import com.gestion.dto.ProjetDTO;
import com.gestion.mapper.EmployeMapper;
import com.gestion.mapper.ProjetMapper;
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
                        .map(ProjetMapper::toDTO)
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
        return ResponseEntity.ok(EmployeMapper.toResponseDTO(employeService.findById(userId)));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
