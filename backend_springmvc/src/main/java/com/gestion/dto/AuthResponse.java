package com.gestion.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String nom;
    private String prenom;
    private Long id;

    public AuthResponse() {}

    public AuthResponse(String token, String role, String nom, String prenom, Long id) {
        this.token = token;
        this.role = role;
        this.nom = nom;
        this.prenom = prenom;
        this.id = id;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}