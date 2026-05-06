package com.gestion.mapper;

import com.gestion.dto.EmployeResponseDTO;
import com.gestion.entity.Employe;

public final class EmployeMapper {

    private EmployeMapper() {
    }

    public static EmployeResponseDTO toResponseDTO(Employe employe) {
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
