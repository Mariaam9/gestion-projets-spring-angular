package com.gestion.repository;

import com.gestion.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeRepository extends JpaRepository<Employe, Long> {
    List<Employe> findByCategorieId(Long categorieId);
}
