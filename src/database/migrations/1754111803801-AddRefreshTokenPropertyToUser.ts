import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenPropertyToUser1754111803801 implements MigrationInterface {
    name = 'AddRefreshTokenPropertyToUser1754111803801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
