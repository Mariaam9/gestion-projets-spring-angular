package com.gestion.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Administrateur extends Utilisateur {

    public Administrateur() {}

    public Administrateur(Long id, String nom, String prenom, String email, String password) {
        super(id, nom, prenom, email, password);
    }
}