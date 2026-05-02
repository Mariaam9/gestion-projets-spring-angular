package com.gestion.service.impl;

import com.gestion.config.JwtUtil;
import com.gestion.dto.AuthRequest;
import com.gestion.dto.AuthResponse;
import com.gestion.entity.Administrateur;
import com.gestion.entity.Utilisateur;
import com.gestion.repository.UtilisateurRepository;
import com.gestion.service.AuthService;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UtilisateurRepository utilisateurRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostConstruct
    public void initAdmin() {
        if (!utilisateurRepository.existsByEmail("admin@gestion.com")) {
            Administrateur admin = new Administrateur();
            admin.setNom("Admin");
            admin.setPrenom("System");
            admin.setEmail("admin@gestion.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            utilisateurRepository.save(admin);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return new AuthResponse(token, user.getRole(), user.getNom(), user.getPrenom(), user.getId());
    }
}
