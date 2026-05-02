package com.gestion.service.impl;

import com.gestion.dto.AffectationDTO;
import com.gestion.entity.Affectation;
import com.gestion.entity.Employe;
import com.gestion.entity.Projet;
import com.gestion.repository.AffectationRepository;
import com.gestion.repository.EmployeRepository;
import com.gestion.repository.ProjetRepository;
import com.gestion.service.AffectationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AffectationServiceImpl implements AffectationService {

    private final AffectationRepository affectationRepository;
    private final EmployeRepository employeRepository;
    private final ProjetRepository projetRepository;

    public AffectationServiceImpl(AffectationRepository affectationRepository,
                                  EmployeRepository employeRepository,
                                  ProjetRepository projetRepository) {
        this.affectationRepository = affectationRepository;
        this.employeRepository = employeRepository;
        this.projetRepository = projetRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AffectationDTO> findAll() {
        return affectationRepository.findAllWithDetails().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AffectationDTO> findByProjet(Long projetId) {
        return affectationRepository.findByProjetIdWithDetails(projetId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AffectationDTO> findByEmploye(Long employeId) {
        return affectationRepository.findByEmployeIdWithDetails(employeId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public AffectationDTO create(AffectationDTO dto) {
        Employe employe = employeRepository.findById(dto.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        Projet projet = projetRepository.findById(dto.getProjetId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        Affectation affectation = new Affectation();
        affectation.setEmploye(employe);
        affectation.setProjet(projet);
        affectation.setDateDebut(dto.getDateDebut());
        affectation.setDateFin(dto.getDateFin());

        return toDTO(affectationRepository.save(affectation));
    }

    @Override
    public void delete(Long id) {
        affectationRepository.deleteById(id);
    }

    private AffectationDTO toDTO(Affectation a) {
        AffectationDTO dto = new AffectationDTO();
        dto.setId(a.getId());
        dto.setEmployeId(a.getEmploye().getId());
        dto.setProjetId(a.getProjet().getId());
        dto.setDateDebut(a.getDateDebut());
        dto.setDateFin(a.getDateFin());
        dto.setEmployeNom(a.getEmploye().getNom());
        dto.setEmployePrenom(a.getEmploye().getPrenom());
        dto.setProjetNom(a.getProjet().getNom());
        return dto;
    }
}
