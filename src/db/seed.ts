import { db } from "./index";
import { users, spaces } from "./schema";

// Create default admin user (password: admin123)
const passwordHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // SHA-256 of "admin123"

async function seed() {
  console.log("Seeding database...");

  // Create default admin users
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      {
        name: "Administrateur Principal",
        email: "admin@dancercitoyens.org",
        passwordHash,
        role: "admin",
      },
      {
        name: "Logistique 1",
        email: "logistique1@dancercitoyens.org",
        passwordHash,
        role: "admin",
      },
      {
        name: "Logistique 2",
        email: "logistique2@dancercitoyens.org",
        passwordHash,
        role: "admin",
      },
    ]);
    console.log("  - Admin users created");
  }

  // Create default spaces
  const existingSpaces = await db.select().from(spaces);
  if (existingSpaces.length === 0) {
    await db.insert(spaces).values([
      {
        name: "No Name Artistic Studio Lab",
        description: "Espace principal comprenant les bureaux des départements et une grande salle polyvalente pour les ateliers et performances",
        type: "artistic_studio",
        status: "active",
        surface: 500,
      },
      {
        name: "No Name Eco Lab",
        description: "Espace dédié aux activités écologiques et durables",
        type: "eco_lab",
        status: "active",
        surface: 300,
      },
      {
        name: "La Maison d'Hôte",
        description: "Espace d'accueil et d'hébergement - actuellement en refonte",
        type: "maison_hote",
        status: "renovation",
        surface: 250,
      },
    ]);
    console.log("  - Default spaces created");
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
