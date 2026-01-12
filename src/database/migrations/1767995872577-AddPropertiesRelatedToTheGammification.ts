import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPropertiesRelatedToTheGammification1767995872577 implements MigrationInterface {
    name = 'AddPropertiesRelatedToTheGammification1767995872577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."badges_triggertype_enum" AS ENUM('points', 'blocks_completed', 'challenges_completed', 'level_reached', 'manual')`);
        await queryRunner.query(`ALTER TABLE "badges" ADD "triggerType" "public"."badges_triggertype_enum" NOT NULL DEFAULT 'manual'`);
        await queryRunner.query(`ALTER TABLE "badges" ADD "threshold" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_challenges" ADD "earnedPoints" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "experience" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "levelId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_2735b8ee71c0fa7f68190fe61b5" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_2735b8ee71c0fa7f68190fe61b5"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "levelId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "experience"`);
        await queryRunner.query(`ALTER TABLE "user_challenges" DROP COLUMN "earnedPoints"`);
        await queryRunner.query(`ALTER TABLE "badges" DROP COLUMN "threshold"`);
        await queryRunner.query(`ALTER TABLE "badges" DROP COLUMN "triggerType"`);
        await queryRunner.query(`DROP TYPE "public"."badges_triggertype_enum"`);
    }

}
