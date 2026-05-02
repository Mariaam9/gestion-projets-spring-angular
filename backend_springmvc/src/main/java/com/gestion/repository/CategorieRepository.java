package com.gestion.repository;

import com.gestion.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    boolean existsByNom(String nom);
}
