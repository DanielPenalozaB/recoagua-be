import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserPasswordNullable1758145470874 implements MigrationInterface {
    name = 'MakeUserPasswordNullable1758145470874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
    }

}
