package com.gestion.mapper;

import com.gestion.dto.CategorieDTO;
import com.gestion.entity.Categorie;

public final class CategorieMapper {

    private CategorieMapper() {
    }

    public static CategorieDTO toDTO(Categorie categorie) {
        return new CategorieDTO(
                categorie.getId(),
                categorie.getNom(),
                categorie.getDescription()
        );
    }
}
