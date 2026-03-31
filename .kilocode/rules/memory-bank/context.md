# Active Context: ADC Logistique

## Current State

**Application Status**: Ready for development/testing

The logistics management application for Association Danseurs Citoyens is fully implemented with:
- Multi-admin authentication
- CRUD for all entities (spaces, equipment, stock, purchases, projects, activities)
- Dashboard with statistics and charts
- Statistics page with period filtering and CSV export
- Stock alerts for low inventory
- Responsive sidebar navigation

## Recently Completed

- [x] Database schema with 9 tables
- [x] Drizzle ORM integration with SQLite
- [x] Cookie-based authentication (multi-admin)
- [x] Dashboard with overview statistics
- [x] Spaces management (3 spaces: Artistic Studio, Eco Lab, Maison d'Hote)
- [x] Equipment management with conditions tracking
- [x] Stock management with movements (in/out)
- [x] Purchases/invoices with filtering
- [x] Projects & activities management
- [x] Statistics page with charts (Recharts)
- [x] CSV export functionality
- [x] Low stock alerts
- [x] 3 default admin accounts seeded

## Default Login Credentials

| Email | Password |
|-------|----------|
| admin@dancercitoyens.org | admin123 |
| logistique1@dancercitoyens.org | admin123 |
| logistique2@dancercitoyens.org | admin123 |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| Today | Full logistics management app built |

## Pending Improvements

- [ ] Add user management (add/remove admins)
- [ ] Add password change functionality
- [ ] Add cleanliness check interface
- [ ] Add PDF export for reports
- [ ] Add notifications system
