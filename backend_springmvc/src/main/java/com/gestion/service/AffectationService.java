package com.gestion.service;

import com.gestion.dto.AffectationDTO;
import java.util.List;

public interface AffectationService {
    List<AffectationDTO> findAll();
    List<AffectationDTO> findByProjet(Long projetId);
    List<AffectationDTO> findByEmploye(Long employeId);
    AffectationDTO create(AffectationDTO dto);
    void delete(Long id);
}
