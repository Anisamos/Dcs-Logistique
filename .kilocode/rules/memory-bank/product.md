# Product Context: ADC Logistique

## Why This Application Exists

Le departement logistique de l'Association Danseurs Citoyens gere les operations quotidiennes de trois espaces, les achats pour les projets/activites, et le suivi des stocks. Cette application centralise toute la gestion logistique dans une interface unique.

## User Flows

1. **Connexion**: Admin se connecte avec email/mot de passe
2. **Dashboard**: Vue d'ensemble avec statistiques et alertes
3. **Espaces**: Visualiser/modifier les 3 espaces, leur statut et equipements
4. **Stocks**: Gerer l'inventaire, entrees/sorties, alertes stock faible
5. **Achats**: Enregistrer factures, filtrer par categorie/espace/statut
6. **Projets/Activites**: Planifier projets et leurs activites liees
7. **Statistiques**: Rapports periodes avec export CSV

## UX Goals

- Interface claire et professionnelle (theme ambre/slate)
- Navigation sidebar pour acces rapide
- Modales pour les formulaires (pas de navigation)
- Tableaux avec filtres pour les donnees
- Graphiques interactifs (Recharts)
- Alertes visuelles pour stock faible
- Export CSV pour les rapports

## Key Entities

| Entity | Description |
|--------|-------------|
| Spaces | 3 espaces de l'association |
| Equipment | Materiels par espace |
| Stock | Articles en inventaire |
| Purchases | Achats et factures |
| Projects | Projets de l'association |
| Activities | Activites liees aux projets |
| Users | Administrateurs |
