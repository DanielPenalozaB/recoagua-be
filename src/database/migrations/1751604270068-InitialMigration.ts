import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1751604270068 implements MigrationInterface {
    name = 'InitialMigration1751604270068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "regions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "language" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_4fcd12ed6a046276e2deb08801c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."badges_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "badges" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "image_url" character varying, "requirements" text NOT NULL, "status" "public"."badges_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_8a651318b8de577e8e217676466" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_badges" ("id" SERIAL NOT NULL, "earned_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "badgeId" integer, CONSTRAINT "PK_0ca139216824d745a930065706a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."challenges_difficulty_enum" AS ENUM('easy', 'medium', 'hard')`);
        await queryRunner.query(`CREATE TYPE "public"."challenges_status_enum" AS ENUM('draft', 'active', 'archived')`);
        await queryRunner.query(`CREATE TYPE "public"."challenges_challenge_type_enum" AS ENUM('educational', 'practical', 'community')`);
        await queryRunner.query(`CREATE TABLE "challenges" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "score" integer NOT NULL, "difficulty" "public"."challenges_difficulty_enum" NOT NULL, "status" "public"."challenges_status_enum" NOT NULL DEFAULT 'draft', "challenge_type" "public"."challenges_challenge_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_1e664e93171e20fe4d6125466af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_challenges_completion_status_enum" AS ENUM('not_started', 'in_progress', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "user_challenges" ("id" SERIAL NOT NULL, "completion_status" "public"."user_challenges_completion_status_enum" NOT NULL DEFAULT 'not_started', "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "challengeId" integer, CONSTRAINT "PK_7c111333fc0e3a23528503498de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_progress_completion_status_enum" AS ENUM('not_started', 'in_progress', 'completed')`);
        await queryRunner.query(`CREATE TABLE "user_progress" ("id" SERIAL NOT NULL, "completion_status" "public"."user_progress_completion_status_enum" NOT NULL DEFAULT 'not_started', "completed_at" TIMESTAMP, "earned_points" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "guideId" integer, "moduleId" integer, CONSTRAINT "PK_7b5eb2436efb0051fdf05cbe839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."guide_difficulty_enum" AS ENUM('beginner', 'intermediate', 'advanced')`);
        await queryRunner.query(`CREATE TYPE "public"."guide_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "guide" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "difficulty" "public"."guide_difficulty_enum" NOT NULL, "estimated_duration" integer NOT NULL, "status" "public"."guide_status_enum" NOT NULL DEFAULT 'draft', "language" character varying NOT NULL, "total_points" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_fe92b4af32150e0580d37eacaef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."modules_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "modules" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "order" integer NOT NULL, "points" integer NOT NULL, "status" "public"."modules_status_enum" NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "guideId" integer, CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "block_answers" ("id" SERIAL NOT NULL, "text" text NOT NULL, "is_correct" boolean NOT NULL, "feedback" text, "order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "blockId" integer, CONSTRAINT "PK_a5f3a1b45023e5cb7234166f651" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "relational_pairs" ("id" SERIAL NOT NULL, "left_item" text NOT NULL, "right_item" text NOT NULL, "correct_pair" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "blockId" integer, CONSTRAINT "PK_9bfd1447e1ff050b39e3be436a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."blocks_type_enum" AS ENUM('text', 'video', 'image', 'single_choice', 'multiple_choice', 'relational', 'text_input')`);
        await queryRunner.query(`CREATE TYPE "public"."blocks_dynamic_type_enum" AS ENUM('quiz', 'drag_drop', 'matching', 'fill_blanks')`);
        await queryRunner.query(`CREATE TYPE "public"."blocks_question_type_enum" AS ENUM('factual', 'conceptual', 'procedural', 'metacognitive')`);
        await queryRunner.query(`CREATE TABLE "blocks" ("id" SERIAL NOT NULL, "type" "public"."blocks_type_enum" NOT NULL, "order" integer NOT NULL, "statement" text NOT NULL, "description" text, "resource_url" character varying, "points" integer NOT NULL, "feedback" text, "dynamic_type" "public"."blocks_dynamic_type_enum", "question_type" "public"."blocks_question_type_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "moduleId" integer, CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_answer_details" ("id" SERIAL NOT NULL, "custom_answer" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "responseId" integer, "answerId" integer, "relationalPairId" integer, CONSTRAINT "PK_5f8494512ddfc76e90152552380" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_block_responses" ("id" SERIAL NOT NULL, "is_correct" boolean NOT NULL, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "blockId" integer, CONSTRAINT "PK_e549ec51af395ff7e6418087e61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_actions_action_type_enum" AS ENUM('login', 'logout', 'guide_started', 'guide_completed', 'module_completed', 'challenge_started', 'challenge_completed', 'badge_earned', 'level_up', 'password_change', 'profile_update')`);
        await queryRunner.query(`CREATE TABLE "user_actions" ("id" SERIAL NOT NULL, "action_type" "public"."user_actions_action_type_enum" NOT NULL, "description" text, "performed_at" TIMESTAMP NOT NULL DEFAULT now(), "ip_address" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_3c8a683381b553ee59ce5b7b13a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'moderator', 'citizen')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'pending')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "password" character varying NOT NULL, "password_set" boolean NOT NULL DEFAULT false, "password_reset_token" character varying(255), "password_reset_expires" TIMESTAMP WITH TIME ZONE, "email_confirmation_token" character varying(255), "email_confirmed" boolean NOT NULL DEFAULT false, "role" "public"."user_role_enum" NOT NULL, "language" character varying(10) NOT NULL, "status" "public"."user_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "cityId" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "rainfall" double precision, "language" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "regionId" integer, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "zone" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "rainfall" double precision, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "recommendations" text, "status" character varying NOT NULL, "altitude" double precision, "soil_type" character varying, "avg_temperature" double precision, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "cityId" integer, CONSTRAINT "PK_bd3989e5a3c3fb5ed546dfaf832" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "levels" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "required_points" integer NOT NULL, "rewards" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_05f8dd8f715793c64d49e3f1901" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "FK_7043fd1cb64ec3f5ebdb878966c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "FK_bd34ef334baea6f589a53438a1e" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_challenges" ADD CONSTRAINT "FK_b5566f854f08d7c88e6ebc71eb1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_challenges" ADD CONSTRAINT "FK_640161d2f02abec6529e6f04104" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_f6adf101322b855e8ce1dec2598" FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_40d3b532069a2ca344669318baa" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_84a7ad570ead189b31bd5f66502" FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_answers" ADD CONSTRAINT "FK_e812d1c67988bafd3be8d43ad21" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "relational_pairs" ADD CONSTRAINT "FK_dcea5962c554216f66b9187d4f9" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_689d0469c27fb8335c4dad7d952" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer_details" ADD CONSTRAINT "FK_ff807d0d4e17dac11380079dc64" FOREIGN KEY ("responseId") REFERENCES "user_block_responses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer_details" ADD CONSTRAINT "FK_217f41f0b01d3fa7a18c9222a30" FOREIGN KEY ("answerId") REFERENCES "block_answers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer_details" ADD CONSTRAINT "FK_33924a23f8c216ccc966f6b91e0" FOREIGN KEY ("relationalPairId") REFERENCES "relational_pairs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_block_responses" ADD CONSTRAINT "FK_83c8be7ed20d39004d28873024e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_block_responses" ADD CONSTRAINT "FK_f0bc25ba49232974652b13909a8" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_actions" ADD CONSTRAINT "FK_e65a8053e5b02e0b89947b6bac9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_3785318df310caf8cb8e1e37d85" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_53122d8c74ee70061deb5343f78" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zone" ADD CONSTRAINT "FK_fd888d571e58d1d50c70fc9d755" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zone" DROP CONSTRAINT "FK_fd888d571e58d1d50c70fc9d755"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_53122d8c74ee70061deb5343f78"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_3785318df310caf8cb8e1e37d85"`);
        await queryRunner.query(`ALTER TABLE "user_actions" DROP CONSTRAINT "FK_e65a8053e5b02e0b89947b6bac9"`);
        await queryRunner.query(`ALTER TABLE "user_block_responses" DROP CONSTRAINT "FK_f0bc25ba49232974652b13909a8"`);
        await queryRunner.query(`ALTER TABLE "user_block_responses" DROP CONSTRAINT "FK_83c8be7ed20d39004d28873024e"`);
        await queryRunner.query(`ALTER TABLE "user_answer_details" DROP CONSTRAINT "FK_33924a23f8c216ccc966f6b91e0"`);
        await queryRunner.query(`ALTER TABLE "user_answer_details" DROP CONSTRAINT "FK_217f41f0b01d3fa7a18c9222a30"`);
        await queryRunner.query(`ALTER TABLE "user_answer_details" DROP CONSTRAINT "FK_ff807d0d4e17dac11380079dc64"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_689d0469c27fb8335c4dad7d952"`);
        await queryRunner.query(`ALTER TABLE "relational_pairs" DROP CONSTRAINT "FK_dcea5962c554216f66b9187d4f9"`);
        await queryRunner.query(`ALTER TABLE "block_answers" DROP CONSTRAINT "FK_e812d1c67988bafd3be8d43ad21"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_84a7ad570ead189b31bd5f66502"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_40d3b532069a2ca344669318baa"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_f6adf101322b855e8ce1dec2598"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89"`);
        await queryRunner.query(`ALTER TABLE "user_challenges" DROP CONSTRAINT "FK_640161d2f02abec6529e6f04104"`);
        await queryRunner.query(`ALTER TABLE "user_challenges" DROP CONSTRAINT "FK_b5566f854f08d7c88e6ebc71eb1"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "FK_bd34ef334baea6f589a53438a1e"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "FK_7043fd1cb64ec3f5ebdb878966c"`);
        await queryRunner.query(`DROP TABLE "levels"`);
        await queryRunner.query(`DROP TABLE "zone"`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_actions"`);
        await queryRunner.query(`DROP TYPE "public"."user_actions_action_type_enum"`);
        await queryRunner.query(`DROP TABLE "user_block_responses"`);
        await queryRunner.query(`DROP TABLE "user_answer_details"`);
        await queryRunner.query(`DROP TABLE "blocks"`);
        await queryRunner.query(`DROP TYPE "public"."blocks_question_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."blocks_dynamic_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."blocks_type_enum"`);
        await queryRunner.query(`DROP TABLE "relational_pairs"`);
        await queryRunner.query(`DROP TABLE "block_answers"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP TYPE "public"."modules_status_enum"`);
        await queryRunner.query(`DROP TABLE "guide"`);
        await queryRunner.query(`DROP TYPE "public"."guide_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."guide_difficulty_enum"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
        await queryRunner.query(`DROP TYPE "public"."user_progress_completion_status_enum"`);
        await queryRunner.query(`DROP TABLE "user_challenges"`);
        await queryRunner.query(`DROP TYPE "public"."user_challenges_completion_status_enum"`);
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TYPE "public"."challenges_challenge_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."challenges_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."challenges_difficulty_enum"`);
        await queryRunner.query(`DROP TABLE "user_badges"`);
        await queryRunner.query(`DROP TABLE "badges"`);
        await queryRunner.query(`DROP TYPE "public"."badges_status_enum"`);
        await queryRunner.query(`DROP TABLE "regions"`);
    }

}
