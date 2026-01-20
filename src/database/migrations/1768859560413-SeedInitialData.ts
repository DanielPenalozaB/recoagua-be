import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedInitialData1768859560413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Regions
    // Check and insert regions if they don't exist
    const regions = [
      {
        name: "Amazonas",
        description: "Departamento en el sur de Colombia",
        language: "es",
      },
      {
        name: "Antioquia",
        description: "Departamento en el noroeste de Colombia",
        language: "es",
      },
      {
        name: "Arauca",
        description: "Departamento en el este de Colombia",
        language: "es",
      },
      {
        name: "Atlántico",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Bolívar",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Boyacá",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Caldas",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Caquetá",
        description: "Departamento en el sur de Colombia",
        language: "es",
      },
      {
        name: "Casanare",
        description: "Departamento en el este de Colombia",
        language: "es",
      },
      {
        name: "Cauca",
        description: "Departamento en el suroeste de Colombia",
        language: "es",
      },
      {
        name: "Cesar",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Chocó",
        description: "Departamento en el oeste de Colombia",
        language: "es",
      },
      {
        name: "Córdoba",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Cundinamarca",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Guainía",
        description: "Departamento en el este de Colombia",
        language: "es",
      },
      {
        name: "Guaviare",
        description: "Departamento en el sur de Colombia",
        language: "es",
      },
      {
        name: "Huila",
        description: "Departamento en el suroeste de Colombia",
        language: "es",
      },
      {
        name: "La Guajira",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Magdalena",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Meta",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Nariño",
        description: "Departamento en el suroeste de Colombia",
        language: "es",
      },
      {
        name: "Norte de Santander",
        description: "Departamento en el noreste de Colombia",
        language: "es",
      },
      {
        name: "Putumayo",
        description: "Departamento en el sur de Colombia",
        language: "es",
      },
      {
        name: "Quindío",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Risaralda",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "San Andrés y Providencia",
        description: "Departamento insular de Colombia",
        language: "es",
      },
      {
        name: "Santander",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Sucre",
        description: "Departamento en el norte de Colombia",
        language: "es",
      },
      {
        name: "Tolima",
        description: "Departamento en el centro de Colombia",
        language: "es",
      },
      {
        name: "Valle del Cauca",
        description: "Departamento en el suroeste de Colombia",
        language: "es",
      },
      {
        name: "Vaupés",
        description: "Departamento en el este de Colombia",
        language: "es",
      },
      {
        name: "Vichada",
        description: "Departamento en el este de Colombia",
        language: "es",
      },
    ];

    for (const region of regions) {
      const exists = await queryRunner.query(
        `SELECT id FROM "regions" WHERE name = '${region.name}'`,
      );
      if (exists.length === 0) {
        await queryRunner.query(
          `INSERT INTO "regions" (name, description, language) VALUES ('${region.name}', '${region.description}', '${region.language}')`,
        );
      }
    }

    // 2. Cities
    // We need region IDs to insert cities
    const cities = [
      {
        name: "Leticia",
        regionName: "Amazonas",
        description: "Capital de Amazonas",
        rainfall: 2000,
        language: "es",
      },
      {
        name: "Medellín",
        regionName: "Antioquia",
        description: "Capital de Antioquia",
        rainfall: 1500,
        language: "es",
      },
      {
        name: "Arauca",
        regionName: "Arauca",
        description: "Capital de Arauca",
        rainfall: 1800,
        language: "es",
      },
      {
        name: "Barranquilla",
        regionName: "Atlántico",
        description: "Capital de Atlántico",
        rainfall: 800,
        language: "es",
      },
      {
        name: "Cartagena",
        regionName: "Bolívar",
        description: "Capital de Bolívar",
        rainfall: 900,
        language: "es",
      },
      {
        name: "Tunja",
        regionName: "Boyacá",
        description: "Capital de Boyacá",
        rainfall: 1000,
        language: "es",
      },
      {
        name: "Manizales",
        regionName: "Caldas",
        description: "Capital de Caldas",
        rainfall: 2000,
        language: "es",
      },
      {
        name: "Florencia",
        regionName: "Caquetá",
        description: "Capital de Caquetá",
        rainfall: 2500,
        language: "es",
      },
      {
        name: "Yopal",
        regionName: "Casanare",
        description: "Capital de Casanare",
        rainfall: 1800,
        language: "es",
      },
      {
        name: "Popayán",
        regionName: "Cauca",
        description: "Capital de Cauca",
        rainfall: 1900,
        language: "es",
      },
      {
        name: "Valledupar",
        regionName: "Cesar",
        description: "Capital de Cesar",
        rainfall: 1400,
        language: "es",
      },
      {
        name: "Quibdó",
        regionName: "Chocó",
        description: "Capital de Chocó",
        rainfall: 4000,
        language: "es",
      },
      {
        name: "Montería",
        regionName: "Córdoba",
        description: "Capital de Córdoba",
        rainfall: 1200,
        language: "es",
      },
      {
        name: "Bogotá",
        regionName: "Cundinamarca",
        description: "Capital de Colombia",
        rainfall: 800,
        language: "es",
      },
      {
        name: "Inírida",
        regionName: "Guainía",
        description: "Capital de Guainía",
        rainfall: 2600,
        language: "es",
      },
      {
        name: "San José del Guaviare",
        regionName: "Guaviare",
        description: "Capital de Guaviare",
        rainfall: 2200,
        language: "es",
      },
      {
        name: "Neiva",
        regionName: "Huila",
        description: "Capital de Huila",
        rainfall: 1300,
        language: "es",
      },
      {
        name: "Riohacha",
        regionName: "La Guajira",
        description: "Capital de La Guajira",
        rainfall: 500,
        language: "es",
      },
      {
        name: "Santa Marta",
        regionName: "Magdalena",
        description: "Capital de Magdalena",
        rainfall: 950,
        language: "es",
      },
      {
        name: "Villavicencio",
        regionName: "Meta",
        description: "Capital de Meta",
        rainfall: 3000,
        language: "es",
      },
      {
        name: "Pasto",
        regionName: "Nariño",
        description: "Capital de Nariño",
        rainfall: 800,
        language: "es",
      },
      {
        name: "Cúcuta",
        regionName: "Norte de Santander",
        description: "Capital de Norte de Santander",
        rainfall: 900,
        language: "es",
      },
      {
        name: "Mocoa",
        regionName: "Putumayo",
        description: "Capital de Putumayo",
        rainfall: 3500,
        language: "es",
      },
      {
        name: "Armenia",
        regionName: "Quindío",
        description: "Capital de Quindío",
        rainfall: 2100,
        language: "es",
      },
      {
        name: "Pereira",
        regionName: "Risaralda",
        description: "Capital de Risaralda",
        rainfall: 2100,
        language: "es",
      },
      {
        name: "San Andrés",
        regionName: "San Andrés y Providencia",
        description: "Capital de San Andrés y Providencia",
        rainfall: 1700,
        language: "es",
      },
      {
        name: "Bucaramanga",
        regionName: "Santander",
        description: "Capital de Santander",
        rainfall: 1200,
        language: "es",
      },
      {
        name: "Sincelejo",
        regionName: "Sucre",
        description: "Capital de Sucre",
        rainfall: 1100,
        language: "es",
      },
      {
        name: "Ibagué",
        regionName: "Tolima",
        description: "Capital de Tolima",
        rainfall: 1500,
        language: "es",
      },
      {
        name: "Santiago de Cali",
        regionName: "Valle del Cauca",
        description: "Capital del Valle del Cauca",
        rainfall: 1000,
        language: "es",
      },
      {
        name: "Mitú",
        regionName: "Vaupés",
        description: "Capital de Vaupés",
        rainfall: 2800,
        language: "es",
      },
      {
        name: "Puerto Carreño",
        regionName: "Vichada",
        description: "Capital de Vichada",
        rainfall: 2200,
        language: "es",
      },
    ];

    for (const city of cities) {
      const region = await queryRunner.query(
        `SELECT id FROM "regions" WHERE name = '${city.regionName}'`,
      );
      if (region.length > 0) {
        const regionId = region[0].id;
        const exists = await queryRunner.query(
          `SELECT id FROM "cities" WHERE name = '${city.name}'`,
        );
        if (exists.length === 0) {
          await queryRunner.query(
            `INSERT INTO "cities" (name, description, rainfall, language, "regionId") VALUES ('${city.name}', '${city.description}', ${city.rainfall}, '${city.language}', ${regionId})`,
          );
        }
      }
    }

    // 3. Levels (Ensuring they exist in Spanish/Context)
    // The previous migration might have added some, adding more specific context if needed or just skipping if satisfied.
    // User requested "created registries in spanish... levels".
    // Let's ensure at least one basic level structure exists if empty, but likely the previous migration handled it.
    // We'll add a 'Embajador del Agua' level if not exists.
    const extraLevels = [
      {
        name: "Embajador del Agua",
        description: "Representante de la conservación del agua",
        requiredPoints: 2000,
        rewards: "Acceso a eventos exclusivos",
      },
    ];

    for (const level of extraLevels) {
      const exists = await queryRunner.query(
        `SELECT id FROM "levels" WHERE name = '${level.name}'`,
      );
      if (exists.length === 0) {
        await queryRunner.query(
          `INSERT INTO "levels" (name, description, "requiredPoints", rewards) VALUES ('${level.name}', '${level.description}', ${level.requiredPoints}, '${level.rewards}')`,
        );
      }
    }

    // 4. Challenges
    const challenges = [
      {
        name: "Cierra el grifo",
        description: "Cierra el grifo mientras te cepillas los dientes",
        score: 50,
        difficulty: "easy",
        status: "active",
        challengeType: "practical",
      },
      {
        name: "Reporta una fuga",
        description: "Reporta una fuga de agua en tu comunidad",
        score: 100,
        difficulty: "medium",
        status: "active",
        challengeType: "community",
      },
    ];

    for (const challenge of challenges) {
      const exists = await queryRunner.query(
        `SELECT id FROM "challenges" WHERE name = '${challenge.name}'`,
      );
      if (exists.length === 0) {
        await queryRunner.query(
          `INSERT INTO "challenges" (name, description, score, difficulty, status, "challengeType") VALUES ('${challenge.name}', '${challenge.description}', ${challenge.score}, '${challenge.difficulty}', '${challenge.status}', '${challenge.challengeType}')`,
        );
      }
    }

    // 5. Badges
    const badges = [
      {
        name: "Defensor de Cali",
        description: "Otorgada por participar en eventos en Cali",
        imageUrl: "https://recoagua.com/badges/cali-defender.png",
        requirements: "Participate in Cali events",
        triggerType: "manual",
        threshold: 0,
        status: "active",
      },
      {
        name: "Ahorrador de Agua",
        description: "Otorgada por reducir el consumo de agua visiblemente",
        imageUrl: "https://recoagua.com/badges/water-saver.png",
        requirements: "Reduce water bill",
        triggerType: "manual",
        threshold: 0,
        status: "active",
      },
    ];

    for (const badge of badges) {
      const exists = await queryRunner.query(
        `SELECT id FROM "badges" WHERE name = '${badge.name}'`,
      );
      if (exists.length === 0) {
        await queryRunner.query(
          `INSERT INTO "badges" (name, description, "imageUrl", requirements, "triggerType", threshold, status) VALUES ('${badge.name}', '${badge.description}', '${badge.imageUrl}', '${badge.requirements}', '${badge.triggerType}', ${badge.threshold}, '${badge.status}')`,
        );
      }
    }

    // 6. Admin User
    // Admin needs a city, we'll assign 'Santiago de Cali'
    const adminEmail = "admin@recoagua.com";
    const adminExists = await queryRunner.query(
      `SELECT id FROM "users" WHERE email = '${adminEmail}'`,
    );

    if (adminExists.length === 0) {
      const cali = await queryRunner.query(
        `SELECT id FROM "cities" WHERE name = 'Santiago de Cali'`,
      );

      if (cali.length > 0) {
        const cityId = cali[0].id;
        const passwordHash =
          "$2b$10$VzG/ZQkjD14TselajYb7L.TWTJEYixuaQal9nhCKUdCB.6zDx2V8e"; // Password123!

        await queryRunner.query(
          `INSERT INTO "users" (
            email, name, password, "passwordSet", role, "cityId", language, status, experience, "emailConfirmed", "createdAt", "updatedAt"
          ) VALUES (
            '${adminEmail}', 'Administrador', '${passwordHash}', true, 'admin', ${cityId}, 'es', 'active', 0, true, NOW(), NOW()
          )`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete Admin
    await queryRunner.query(
      `DELETE FROM "users" WHERE email = 'admin@recoagua.com'`,
    );

    // Delete Badges
    await queryRunner.query(
      `DELETE FROM "badges" WHERE name IN ('Defensor de Cali', 'Ahorrador de Agua')`,
    );

    // Delete Challenges
    await queryRunner.query(
      `DELETE FROM "challenges" WHERE name IN ('Cierra el grifo', 'Reporta una fuga')`,
    );

    // Delete Levels
    await queryRunner.query(
      `DELETE FROM "levels" WHERE name = 'Embajador del Agua'`,
    );

    // Delete Cities
    await queryRunner.query(
      `DELETE FROM "cities" WHERE name IN ('Santiago de Cali', 'Bogotá', 'Medellín')`,
    );

    // Delete Regions (Only if they have no cities linked, but cascading might handle it or error. For safety, we try delete)
    // In strict envs, we'd need to be careful. Here we assume we want to clean what we created.
    await queryRunner.query(
      `DELETE FROM "regions" WHERE name IN ('Valle del Cauca', 'Cundinamarca', 'Antioquia')`,
    );
  }
}
