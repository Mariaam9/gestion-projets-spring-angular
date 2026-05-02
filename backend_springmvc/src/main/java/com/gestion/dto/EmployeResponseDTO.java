package com.gestion.dto;

public class EmployeResponseDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String matricule;
    private Long categorieId;
    private String categorieNom;

    public EmployeResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public Long getCategorieId() { return categorieId; }
    public void setCategorieId(Long categorieId) { this.categorieId = categorieId; }

    public String getCategorieNom() { return categorieNom; }
    public void setCategorieNom(String categorieNom) { this.categorieNom = categorieNom; }
}
