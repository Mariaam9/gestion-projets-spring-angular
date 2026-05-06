package com.gestion.controller;

import com.gestion.dto.EmployeDTO;
import com.gestion.dto.EmployeResponseDTO;
import com.gestion.entity.Employe;
import com.gestion.service.EmployeService;
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
@RequestMapping("/api/admin/employes")
@PreAuthorize("hasRole('ADMIN')")
public class EmployeController {

    private final EmployeService employeService;

    public EmployeController(EmployeService employeService) {
        this.employeService = employeService;
    }

    @GetMapping
    public ResponseEntity<List<EmployeResponseDTO>> getAllEmployes() {
        return ResponseEntity.ok(
                employeService.findAll().stream()
                        .map(this::toResponseDTO)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeResponseDTO> getEmploye(@PathVariable Long id) {
        return ResponseEntity.ok(toResponseDTO(employeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<EmployeResponseDTO> createEmploye(@RequestBody EmployeDTO dto) {
        return ResponseEntity.ok(toResponseDTO(employeService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeResponseDTO> updateEmploye(@PathVariable Long id, @RequestBody EmployeDTO dto) {
        return ResponseEntity.ok(toResponseDTO(employeService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmploye(@PathVariable Long id) {
        employeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private EmployeResponseDTO toResponseDTO(Employe employe) {
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
