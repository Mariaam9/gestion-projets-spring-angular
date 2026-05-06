package com.gestion.mapper;

import com.gestion.dto.ProjetDTO;
import com.gestion.entity.Projet;

public final class ProjetMapper {

    private ProjetMapper() {
    }

    public static ProjetDTO toDTO(Projet projet) {
        return new ProjetDTO(
                projet.getId(),
                projet.getNom(),
                projet.getDescription(),
                projet.getDateDebut(),
                projet.getDateFin()
        );
    }
}
