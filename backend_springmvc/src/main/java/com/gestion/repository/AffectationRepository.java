package com.gestion.repository;

import com.gestion.entity.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AffectationRepository extends JpaRepository<Affectation, Long> {

    @Query("SELECT a FROM Affectation a JOIN FETCH a.employe JOIN FETCH a.projet")
    List<Affectation> findAllWithDetails();

    @Query("SELECT a FROM Affectation a JOIN FETCH a.employe JOIN FETCH a.projet WHERE a.employe.id = :employeId")
    List<Affectation> findByEmployeIdWithDetails(@Param("employeId") Long employeId);

    @Query("SELECT a FROM Affectation a JOIN FETCH a.employe JOIN FETCH a.projet WHERE a.projet.id = :projetId")
    List<Affectation> findByProjetIdWithDetails(@Param("projetId") Long projetId);

    // Gardees pour compatibilite si elles sont utilisees ailleurs.
    List<Affectation> findByEmployeId(Long employeId);
    List<Affectation> findByProjetId(Long projetId);

    @Query("SELECT a FROM Affectation a JOIN FETCH a.employe JOIN FETCH a.projet WHERE a.projet.id = :projetId")
    List<Affectation> findEmployesByProjet(@Param("projetId") Long projetId);
}
