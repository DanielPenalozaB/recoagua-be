import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedGamificationData1767995872578 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Seed Levels
        const levels = await queryRunner.query(`SELECT id FROM "levels" LIMIT 1`);
        if (levels.length === 0) {
            await queryRunner.query(`
                INSERT INTO "levels" (name, description, "requiredPoints", rewards)
                VALUES 
                ('Novato acuático', 'El principio de tu viaje acuático', 0, 'Insignia de bienvenida'),
                ('Guardián del agua', 'Protegiendo los recursos activamente', 1000, 'Marco especial'),
                ('Maestro del agua', 'Experto en el manejo del agua', 5000, 'Medalla de legendario')
            `);
        }

        // Seed Challenges
        const challenges = await queryRunner.query(`SELECT id FROM "challenges" WHERE name = 'Calculadora'`);
        if (challenges.length === 0) {
            await queryRunner.query(`
                INSERT INTO "challenges" (name, description, score, difficulty, status, "challengeType")
                VALUES ('Calculadora', 'Completa tu primer cálculo de consumo de agua', 100, 'easy', 'active', 'practical')
            `);
        }

        // Seed Badges
        const badges = await queryRunner.query(`SELECT id FROM "badges" LIMIT 1`);
        if (badges.length === 0) {
            await queryRunner.query(`
                INSERT INTO "badges" (name, description, "imageUrl", requirements, "triggerType", threshold, status)
                VALUES 
                ('Primer bloque', 'Completa tu primer bloque de aprendizaje', 'https://api.recoagua.com/assets/badges/first-block.svg', 'Complete 1 block', 'blocks_completed', 1, 'active'),
                ('First Calculation', 'Performed your first water calculation', 'https://api.recoagua.com/assets/badges/calculator.svg', 'Complete the Calculadora challenge', 'challenges_completed', 1, 'active'),
                ('Water Saver', 'Reached 1000 XP', 'https://api.recoagua.com/assets/badges/1000xp.svg', 'Accumulate 1000 XP', 'points', 1000, 'active')
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "levels" WHERE name IN ('Novato acuático', 'Water Guardian', 'Maestro del agua')`);
        await queryRunner.query(`DELETE FROM "challenges" WHERE name = 'Calculadora'`);
        await queryRunner.query(`DELETE FROM "badges" WHERE name IN ('Primer bloque', 'First Calculation', 'Water Saver')`);
    }

}
