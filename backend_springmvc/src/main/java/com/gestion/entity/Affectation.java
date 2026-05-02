package com.gestion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "affectation")
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    public Affectation() {}

    public Affectation(Long id, Employe employe, Projet projet, LocalDate dateDebut, LocalDate dateFin) {
        this.id = id;
        this.employe = employe;
        this.projet = projet;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employe getEmploye() { return employe; }
    public void setEmploye(Employe employe) { this.employe = employe; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }
}