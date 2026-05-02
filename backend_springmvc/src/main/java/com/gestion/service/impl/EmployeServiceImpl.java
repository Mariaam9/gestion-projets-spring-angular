package com.gestion.service.impl;

import com.gestion.dto.EmployeDTO;
import com.gestion.entity.Categorie;
import com.gestion.entity.Employe;
import com.gestion.repository.CategorieRepository;
import com.gestion.repository.EmployeRepository;
import com.gestion.service.EmployeService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeServiceImpl implements EmployeService {

    private final EmployeRepository employeRepository;
    private final CategorieRepository categorieRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeServiceImpl(EmployeRepository employeRepository,
                              CategorieRepository categorieRepository,
                              PasswordEncoder passwordEncoder) {
        this.employeRepository = employeRepository;
        this.categorieRepository = categorieRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Employe> findAll() {
        return employeRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Employe findById(Long id) {
        return employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
    }

    @Override
    public Employe create(EmployeDTO dto) {
        Employe employe = new Employe();
        employe.setNom(dto.getNom());
        employe.setPrenom(dto.getPrenom());
        employe.setEmail(dto.getEmail());
        employe.setPassword(passwordEncoder.encode(dto.getPassword()));
        employe.setMatricule(dto.getMatricule());
        if (dto.getCategorieId() != null) {
            Categorie cat = categorieRepository.findById(dto.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            employe.setCategorie(cat);
        }
        return employeRepository.save(employe);
    }

    @Override
    public Employe update(Long id, EmployeDTO dto) {
        Employe employe = findById(id);
        employe.setNom(dto.getNom());
        employe.setPrenom(dto.getPrenom());
        employe.setEmail(dto.getEmail());
        employe.setMatricule(dto.getMatricule());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            employe.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getCategorieId() != null) {
            Categorie cat = categorieRepository.findById(dto.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            employe.setCategorie(cat);
        }
        return employeRepository.save(employe);
    }

    @Override
    public void delete(Long id) {
        employeRepository.deleteById(id);
    }
}
