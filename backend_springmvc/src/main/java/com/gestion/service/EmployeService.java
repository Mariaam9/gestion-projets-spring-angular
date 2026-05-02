package com.gestion.service;

import com.gestion.dto.EmployeDTO;
import com.gestion.entity.Employe;
import java.util.List;

public interface EmployeService {
    List<Employe> findAll();
    Employe findById(Long id);
    Employe create(EmployeDTO dto);
    Employe update(Long id, EmployeDTO dto);
    void delete(Long id);
}
