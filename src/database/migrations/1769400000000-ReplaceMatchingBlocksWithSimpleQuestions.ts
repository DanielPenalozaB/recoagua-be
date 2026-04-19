import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceMatchingBlocksWithSimpleQuestions1769400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find all interactive/matching blocks
    const matchingBlocks = await queryRunner.query(
      `SELECT b.id, b."moduleId", b."order", b.points
       FROM "blocks" b
       WHERE b.type = 'interactive' AND b.dynamic_type = 'matching'`,
    );

    for (const block of matchingBlocks) {
      // Clean up related data
      await queryRunner.query(
        `DELETE FROM "user_answer_details" WHERE "responseId" IN (SELECT id FROM "user_block_responses" WHERE "blockId" = $1)`,
        [block.id],
      );
      await queryRunner.query(
        `DELETE FROM "user_block_responses" WHERE "blockId" = $1`,
        [block.id],
      );
      await queryRunner.query(
        `DELETE FROM "relational_pairs" WHERE "blockId" = $1`,
        [block.id],
      );
      await queryRunner.query(`DELETE FROM "blocks" WHERE id = $1`, [block.id]);
    }

    // Get module IDs by guide name and module order
    const getModuleId = async (
      guideName: string,
      moduleOrder: number,
    ): Promise<number | null> => {
      const result = await queryRunner.query(
        `SELECT m.id FROM "modules" m
         JOIN "guide" g ON m."guideId" = g.id
         WHERE g.name = $1 AND m."order" = $2`,
        [guideName, moduleOrder],
      );
      return result.length > 0 ? result[0].id : null;
    };

    // Helper to insert a block with answers
    const insertBlock = async (
      moduleId: number,
      block: {
        type: string;
        order: number;
        statement: string;
        points: number;
        questionType: string;
        description?: string;
        feedback?: string;
      },
      answers: {
        text: string;
        isCorrect: boolean;
        order: number;
        feedback?: string;
      }[],
    ) => {
      const blockResult = await queryRunner.query(
        `INSERT INTO "blocks" (type, "order", statement, description, "resourceUrl", points, feedback, "dynamic_type", "question_type", "moduleId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NULL, $5, $6, NULL, $7, $8, NOW(), NOW()) RETURNING id`,
        [
          block.type,
          block.order,
          block.statement,
          block.description || null,
          block.points,
          block.feedback || null,
          block.questionType,
          moduleId,
        ],
      );
      const blockId = blockResult[0].id;

      for (const answer of answers) {
        await queryRunner.query(
          `INSERT INTO "block_answers" (text, "isCorrect", feedback, "order", "blockId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            answer.text,
            answer.isCorrect,
            answer.feedback || null,
            answer.order,
            blockId,
          ],
        );
      }
    };

    // Guide 1: "Importancia del agua y sus propiedades" - Module 2 (El Ciclo Hidrológico)
    const guide1Module2 = await getModuleId(
      "Importancia del agua y sus propiedades",
      2,
    );
    if (guide1Module2) {
      await insertBlock(
        guide1Module2,
        {
          type: "question",
          order: 4,
          statement:
            "¿Cuál de las siguientes afirmaciones sobre las etapas del ciclo hidrológico es correcta?",
          points: 15,
          questionType: "multiple_choice",
        },
        [
          {
            text: "La condensación es cuando el agua penetra en el suelo",
            isCorrect: false,
            order: 1,
          },
          {
            text: "La evaporación es el proceso por el cual el agua se convierte en vapor por el calor del sol",
            isCorrect: true,
            order: 2,
            feedback:
              "Correcto. La evaporación ocurre cuando el sol calienta el agua de océanos y ríos, convirtiéndola en vapor que asciende a la atmósfera.",
          },
          {
            text: "La precipitación es cuando el vapor de agua forma nubes",
            isCorrect: false,
            order: 3,
          },
          {
            text: "La infiltración es cuando el agua cae como lluvia o granizo",
            isCorrect: false,
            order: 4,
          },
        ],
      );
    }

    // Guide 2: "Uso eficiente del agua en el hogar" - Module 2 (Mantenimiento y Fugas)
    const guide2Module2 = await getModuleId(
      "Uso eficiente del agua en el hogar",
      2,
    );
    if (guide2Module2) {
      await insertBlock(
        guide2Module2,
        {
          type: "question",
          order: 4,
          statement:
            "¿Cuál es el beneficio principal de un aireador de grifo?",
          points: 20,
          questionType: "multiple_choice",
        },
        [
          {
            text: "Se cierra automáticamente al retirar las manos",
            isCorrect: false,
            order: 1,
          },
          {
            text: "Permite elegir entre descarga parcial o completa",
            isCorrect: false,
            order: 2,
          },
          {
            text: "Reduce el caudal de agua sin perder presión",
            isCorrect: true,
            order: 3,
            feedback:
              "Correcto. El aireador mezcla aire con el agua, reduciendo el consumo sin que el usuario perciba una pérdida de presión.",
          },
          {
            text: "Filtra las impurezas del agua",
            isCorrect: false,
            order: 4,
          },
        ],
      );
    }

    // Guide 3: "Gestión sostenible del agua para empresas" - Module 2 (Tecnologías de Ahorro)
    const guide3Module2 = await getModuleId(
      "Gestión sostenible del agua para empresas",
      2,
    );
    if (guide3Module2) {
      await insertBlock(
        guide3Module2,
        {
          type: "question",
          order: 4,
          statement:
            "La captación de agua lluvia en empresas es útil principalmente para riego y limpieza de áreas comunes.",
          points: 20,
          questionType: "true_false",
        },
        [
          {
            text: "Verdadero",
            isCorrect: true,
            order: 1,
            feedback:
              "Correcto. El agua lluvia captada se utiliza típicamente para usos no potables como riego de jardines y limpieza de pisos y fachadas.",
          },
          {
            text: "Falso",
            isCorrect: false,
            order: 2,
            feedback:
              "Incorrecto. La captación de agua lluvia es efectivamente más apropiada para usos no potables como riego y limpieza.",
          },
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the replacement blocks (identified by their specific statements)
    const statements = [
      "¿Cuál de las siguientes afirmaciones sobre las etapas del ciclo hidrológico es correcta?",
      "¿Cuál es el beneficio principal de un aireador de grifo?",
      "La captación de agua lluvia en empresas es útil principalmente para riego y limpieza de áreas comunes.",
    ];

    for (const statement of statements) {
      const blocks = await queryRunner.query(
        `SELECT id FROM "blocks" WHERE statement = $1`,
        [statement],
      );
      for (const block of blocks) {
        await queryRunner.query(
          `DELETE FROM "user_answer_details" WHERE "responseId" IN (SELECT id FROM "user_block_responses" WHERE "blockId" = $1)`,
          [block.id],
        );
        await queryRunner.query(
          `DELETE FROM "user_block_responses" WHERE "blockId" = $1`,
          [block.id],
        );
        await queryRunner.query(
          `DELETE FROM "block_answers" WHERE "blockId" = $1`,
          [block.id],
        );
        await queryRunner.query(`DELETE FROM "blocks" WHERE id = $1`, [
          block.id,
        ]);
      }
    }
  }
}
