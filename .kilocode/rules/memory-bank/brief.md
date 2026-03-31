# Project Brief: ADC Logistique

## Purpose

Application de gestion logistique pour l'Association Danseurs Citoyens. Gere les espaces, equipements, stocks, achats/factures, projets et activites du departement logistique.

## Target Users

- Manager du departement logistique de l'ADC
- Employes du departement logistique (3+)
- Administrateurs multiples avec acces simultane

## Core Use Case

Application web permettant de gerer:
1. Les trois espaces de l'association (No Name Artistic Studio Lab, No Name Eco Lab, La Maison d'Hote)
2. Les equipements et materiaux de chaque espace
3. Le stock et les fournitures (bureau, nettoyage, materiaux)
4. Les achats et factures (logistique operationnelle et projets)
5. Les projets et activites avec leurs besoins logistiques
6. Les statistiques automatiques (quotidien, hebdomadaire, mensuel, trimestriel, semestriel, annuel)

## Key Requirements

### Must Have
- Authentification multi-admin
- Gestion CRUD pour toutes les entites
- Tableau de bord avec statistiques en temps reel
- Alertes stock faible
- Export des donnees (CSV)
- Graphiques de suivi des depenses

### Spaces Managed
1. **No Name Artistic Studio Lab** - Bureaux + Salle polyvalente (actif)
2. **No Name Eco Lab** - Espace eco-lab (actif)
3. **La Maison d'Hote** - En refonte/travaux

## Constraints

- Framework: Next.js 16 + React 19 + Tailwind CSS 4
- Package manager: Bun
- Database: SQLite via Drizzle ORM
- Multi-admin (pas de roles differencies)
