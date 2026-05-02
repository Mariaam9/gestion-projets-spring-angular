package com.gestion.service.impl;

import com.gestion.entity.Projet;
import com.gestion.repository.ProjetRepository;
import com.gestion.service.ProjetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjetServiceImpl implements ProjetService {

    private final ProjetRepository projetRepository;

    public ProjetServiceImpl(ProjetRepository projetRepository) {
        this.projetRepository = projetRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Projet> findAll() {
        return projetRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Projet findById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    @Override
    public Projet create(Projet projet) {
        return projetRepository.save(projet);
    }

    @Override
    public Projet update(Long id, Projet projet) {
        Projet existing = findById(id);
        existing.setNom(projet.getNom());
        existing.setDescription(projet.getDescription());
        existing.setDateDebut(projet.getDateDebut());
        existing.setDateFin(projet.getDateFin());
        return projetRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        projetRepository.deleteById(id);
    }
}
