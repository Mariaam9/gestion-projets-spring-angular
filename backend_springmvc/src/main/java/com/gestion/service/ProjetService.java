package com.gestion.service;

import com.gestion.entity.Projet;
import java.util.List;

public interface ProjetService {
    List<Projet> findAll();
    Projet findById(Long id);
    Projet create(Projet projet);
    Projet update(Long id, Projet projet);
    void delete(Long id);
}
