import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedZonesCali1768861054148 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Get Santiago de Cali ID
    const cali = await queryRunner.query(
      `SELECT id FROM "cities" WHERE name = 'Santiago de Cali'`,
    );

    if (cali.length > 0) {
      const cityId = cali[0].id;

      const zones = [
        {
          name: "Pance",
          description:
            "Zona sur con alta pluviosidad, ideal para recolección doméstica.",
          rainfall: 1800,
          altitude: 1200,
          latitude: 3.32,
          longitude: -76.53,
          recommendations:
            "Instalar sistemas de recolección en techos amplios.",
          status: "active",
          soilType: "sandy_loam",
          avgTemperature: 22,
        },
        {
          name: "Farallones",
          description: "Zona montañosa con máxima precipitación.",
          rainfall: 2500,
          altitude: 2600,
          latitude: 3.42,
          longitude: -76.65,
          recommendations: "Recolección de niebla y escorrentía controlada.",
          status: "active",
          soilType: "rocky",
          avgTemperature: 15,
        },
        {
          name: "La Leonera",
          description: "Corregimiento en zona de ladera.",
          rainfall: 1600,
          altitude: 1500,
          latitude: 3.45,
          longitude: -76.6,
          recommendations: "Tanques de almacenamiento de gran capacidad.",
          status: "active",
          soilType: "clay",
          avgTemperature: 20,
        },
        {
          name: "Ladera de Meléndez",
          description: "Zona suroeste con lluvias frecuentes.",
          rainfall: 1400,
          altitude: 1000,
          latitude: 3.4,
          longitude: -76.55,
          recommendations: "Filtros de primeras lluvias para calidad de agua.",
          status: "active",
          soilType: "loam",
          avgTemperature: 24,
        },
        {
          name: "Cañaveralejo",
          description: "Zona urbana de piedemonte.",
          rainfall: 1300,
          altitude: 950,
          latitude: 3.41,
          longitude: -76.54,
          recommendations: "Sistemas modulares para viviendas.",
          status: "active",
          soilType: "clay_loam",
          avgTemperature: 25,
        },
      ];

      for (const zone of zones) {
        const exists = await queryRunner.query(
          `SELECT id FROM "zone" WHERE name = '${zone.name}' AND "cityId" = ${cityId}`,
        );

        if (exists.length === 0) {
          await queryRunner.query(
            `INSERT INTO "zone" (
              name, description, rainfall, altitude, latitude, longitude, recommendations, status, "soilType", "avgTemperature", "cityId", "createdAt", "updatedAt"
            ) VALUES (
              '${zone.name}', '${zone.description}', ${zone.rainfall}, ${zone.altitude}, ${zone.latitude}, ${zone.longitude}, '${zone.recommendations}', '${zone.status}', '${zone.soilType}', ${zone.avgTemperature}, ${cityId}, NOW(), NOW()
            )`,
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cali = await queryRunner.query(
      `SELECT id FROM "cities" WHERE name = 'Santiago de Cali'`,
    );

    if (cali.length > 0) {
      const cityId = cali[0].id;
      await queryRunner.query(
        `DELETE FROM "zone" WHERE name IN ('Pance', 'Farallones', 'La Leonera', 'Ladera de Meléndez', 'Cañaveralejo') AND "cityId" = ${cityId}`,
      );
    }
  }
}
