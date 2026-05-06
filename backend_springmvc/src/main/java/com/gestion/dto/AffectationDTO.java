package com.gestion.dto;

import java.time.LocalDate;

public class AffectationDTO {
    private Long id;
    private Long employeId;
    private Long projetId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String employeNom;
    private String employePrenom;
    private String employeEmail;
    private String projetNom;

    public AffectationDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeId() { return employeId; }
    public void setEmployeId(Long employeId) { this.employeId = employeId; }

    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getEmployeNom() { return employeNom; }
    public void setEmployeNom(String employeNom) { this.employeNom = employeNom; }

    public String getEmployePrenom() { return employePrenom; }
    public void setEmployePrenom(String employePrenom) { this.employePrenom = employePrenom; }

    public String getEmployeEmail() { return employeEmail; }
    public void setEmployeEmail(String employeEmail) { this.employeEmail = employeEmail; }

    public String getProjetNom() { return projetNom; }
    public void setProjetNom(String projetNom) { this.projetNom = projetNom; }
}