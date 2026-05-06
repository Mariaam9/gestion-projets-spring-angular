package com.gestion.repository;

import com.gestion.entity.Employe;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeRepository extends JpaRepository<Employe, Long> {

    @Override
    @EntityGraph(attributePaths = "categorie")
    List<Employe> findAll();

    @Override
    @EntityGraph(attributePaths = "categorie")
    Optional<Employe> findById(Long id);

    @EntityGraph(attributePaths = "categorie")
    List<Employe> findByCategorieId(Long categorieId);
}
