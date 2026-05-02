package com.gestion.service.impl;

import com.gestion.entity.Categorie;
import com.gestion.repository.CategorieRepository;
import com.gestion.service.CategorieService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategorieServiceImpl implements CategorieService {

    private final CategorieRepository categorieRepository;

    public CategorieServiceImpl(CategorieRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categorie> findAll() {
        return categorieRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Categorie findById(Long id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
    }

    @Override
    public Categorie create(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    @Override
    public Categorie update(Long id, Categorie categorie) {
        Categorie existing = findById(id);
        existing.setNom(categorie.getNom());
        existing.setDescription(categorie.getDescription());
        return categorieRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        categorieRepository.deleteById(id);
    }
}
