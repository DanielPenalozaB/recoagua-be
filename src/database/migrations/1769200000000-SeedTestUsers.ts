import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedTestUsers1769200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await bcrypt.hash("Prueba2026!", 12);

    const cali = await queryRunner.query(
      `SELECT id FROM "cities" WHERE name = 'Santiago de Cali' LIMIT 1`,
    );

    if (cali.length === 0) return;

    const cityId = cali[0].id;

    for (let i = 1; i <= 10; i++) {
      const email = `prueba${i}@recoagua.com`;
      const exists = await queryRunner.query(
        `SELECT id FROM "users" WHERE email = $1`,
        [email],
      );

      if (exists.length === 0) {
        await queryRunner.query(
          `INSERT INTO "users" (
            email, name, password, "passwordSet", role, "cityId", language, status, experience, "emailConfirmed", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, true, 'citizen', $4, 'es', 'active', 0, true, NOW(), NOW())`,
          [email, `Usuario de Prueba ${i}`, passwordHash, cityId],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const emails = Array.from(
      { length: 10 },
      (_, i) => `prueba${i + 1}@recoagua.com`,
    );

    for (const email of emails) {
      await queryRunner.query(
        `DELETE FROM "user_block_responses" WHERE "userId" IN (SELECT id FROM "users" WHERE email = $1)`,
        [email],
      );
      await queryRunner.query(
        `DELETE FROM "user_progress" WHERE "userId" IN (SELECT id FROM "users" WHERE email = $1)`,
        [email],
      );
      await queryRunner.query(`DELETE FROM "users" WHERE email = $1`, [email]);
    }
  }
}
