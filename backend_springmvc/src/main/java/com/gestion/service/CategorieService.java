package com.gestion.service;

import com.gestion.entity.Categorie;
import java.util.List;

public interface CategorieService {
    List<Categorie> findAll();
    Categorie findById(Long id);
    Categorie create(Categorie categorie);
    Categorie update(Long id, Categorie categorie);
    void delete(Long id);
}
