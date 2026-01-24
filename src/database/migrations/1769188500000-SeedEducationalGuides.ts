import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedEducationalGuides1769188500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const guides = [
      {
        name: "Importancia del agua y sus propiedades",
        description:
          "Descubre por qué el agua es vital para la vida y conoce sus propiedades únicas.",
        difficulty: "beginner",
        estimatedDuration: 30,
        status: "published",
        language: "es",
        totalPoints: 100,
        modules: [
          {
            name: "Fundamentos del Agua",
            description:
              "Conceptos básicos sobre qué es el agua y su distribución en la Tierra.",
            order: 1,
            points: 50,
            blocks: [
              {
                type: "text",
                order: 1,
                statement:
                  "El agua es una sustancia líquida desprovista de olor, sabor y color, que existe en estado más o menos puro en la naturaleza.",
                description:
                  "Cubre el 71% de la superficie de la corteza terrestre.",
                points: 25,
              },
              {
                type: "text",
                order: 2,
                statement:
                  "El agua tiene propiedades únicas como la capilaridad, la tensión superficial y su capacidad calorífica.",
                points: 25,
              },
            ],
          },
          {
            name: "El Ciclo Hidrológico",
            description: "Entiende cómo se mueve el agua en nuestro planeta.",
            order: 2,
            points: 50,
            blocks: [
              {
                type: "video",
                order: 1,
                statement:
                  "Observa cómo el agua se evapora, condensa y precipita.",
                resourceUrl:
                  "https://www.youtube.com/watch?v=Y0vZotAI_Fs&pp=ygUZbG9zIHRyZXMgZXN0YWRvcyBkZWwgYWd1YQ%3D%3D",
                points: 25,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Cuál es el proceso por el cual el agua pasa de líquido a gas?",
                points: 25,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Evaporación",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "El sol calienta el agua de océanos y ríos (evaporación) y liberan vapor, convirtiéndola en gas.",
                  },
                  {
                    text: "Condensación",
                    isCorrect: false,
                    order: 2,
                  },
                  {
                    text: "Precipitación",
                    isCorrect: false,
                    order: 3,
                  },
                  {
                    text: "Infiltración",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Uso eficiente del agua en el hogar",
        description:
          "Aprende a reducir tu huella hídrica con acciones cotidianas.",
        difficulty: "beginner",
        estimatedDuration: 45,
        status: "published",
        language: "es",
        totalPoints: 100,
        modules: [
          {
            name: "Ahorro en Baño y Cocina",
            description: "Estrategias clave para las zonas de mayor consumo.",
            order: 1,
            points: 50,
            blocks: [
              {
                type: "text",
                order: 1,
                statement:
                  "Cerrar el grifo mientras te cepillas los dientes puede ahorrar hasta 4 litros de agua por minuto.",
                points: 25,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Es mejor tomar un baño de inmersión que una ducha rápida para ahorrar agua?",
                points: 25,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: false,
                    order: 1,
                  },
                  {
                    text: "Falso",
                    isCorrect: true,
                    order: 2,
                  },
                ],
              },
            ],
          },
          {
            name: "Mantenimiento y Fugas",
            description: "Cómo detectar y reparar pérdidas de agua.",
            order: 2,
            points: 50,
            blocks: [
              {
                type: "text",
                order: 1,
                statement:
                  "Un grifo goteando puede desperdiciar más de 30 litros de agua al día.",
                points: 25,
              },
              {
                type: "interactive",
                order: 2,
                statement: "Conecta los pares",
                dynamicType: "matching",
                points: 25,
                relationalPairs: [
                  {
                    leftItem: "Grifo con sensor ahorrador",
                    rightItem:
                      "Evita el desperdicio del agua y se asegura de un uso responsable",
                    correctPair: true,
                  },
                  {
                    leftItem: "Grifo común",
                    rightItem:
                      "Más propenso a ocasionar desperdicios y malos usos del agua",
                    correctPair: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Gestión sostenible del agua para empresas",
        description:
          "Estrategias corporativas para optimizar el recurso hídrico.",
        difficulty: "intermediate",
        estimatedDuration: 60,
        status: "published",
        language: "es",
        totalPoints: 120,
        modules: [
          {
            name: "Auditoría Hídrica",
            description: "Evalúa el consumo actual de tu empresa.",
            order: 1,
            points: 60,
            blocks: [
              {
                type: "text",
                order: 1,
                statement:
                  "Lo que no se mide, no se puede gestionar. Instala medidores en áreas clave.",
                points: 30,
              },
              {
                type: "text",
                order: 2,
                statement:
                  "Identifica procesos industriales o sanitarios con mayor demanda.",
                points: 30,
              },
            ],
          },
          {
            name: "Tecnologías de Ahorro",
            description: "Implementación de dispositivos eficientes.",
            order: 2,
            points: 60,
            blocks: [
              {
                type: "image",
                order: 1,
                statement:
                  "Ejemplo de instalación de sensores para reducción de consumo.",
                resourceUrl: "https://recoagua.com/water-meter-sensor.png",
                points: 30,
              },
              {
                type: "text",
                order: 2,
                statement:
                  "Sistemas para tratar y reutilizar agua en riego o limpieza.",
                points: 30,
              },
            ],
          },
        ],
      },
      {
        name: "Futuro de la sostenibilidad hídrica",
        description: "Desafíos y soluciones para el agua a nivel mundial.",
        difficulty: "advanced",
        status: "published",
        language: "es",
        estimatedDuration: 50,
        totalPoints: 100,
        modules: [
          {
            name: "Desafíos Globales",
            description: "La crisis del agua y el cambio climático.",
            order: 1,
            points: 50,
            blocks: [
              {
                type: "text",
                order: 1,
                statement:
                  "Definición de estrés hídrico y regiones más afectadas.",
                points: 25,
              },
              {
                type: "video",
                order: 2,
                statement:
                  "Impacto de los plásticos en los ecosistemas marinos.",
                resourceUrl:
                  "https://www.youtube.com/watch?v=PzpAgqRsH-A&pp=ygU0SW1wYWN0byBkZSBsb3MgcGzDoXN0aWNvcyBlbiBsb3MgZWNvc2lzdGVtYXMgbWFyaW5vcw%3D%3D",
                points: 25,
              },
            ],
          },
          {
            name: "Innovación y Futuro",
            description:
              "Tecnologías emergentes para garantizar el acceso al agua.",
            order: 2,
            points: 50,
            blocks: [
              {
                type: "text",
                order: 1,
                statement:
                  "Métodos modernos para potabilizar agua de mar con menor impacto energético.",
                points: 25,
              },
              {
                type: "question",
                questionType: "open_ended",
                order: 2,
                statement:
                  "¿Qué acción personal te comprometes a realizar para cuidar el agua?",
                points: 25,
              },
            ],
          },
        ],
      },
    ];

    for (const guide of guides) {
      // 1. Insert Guide
      const guideResult = await queryRunner.query(
        `INSERT INTO "guide" (name, description, difficulty, "estimatedDuration", status, language, "totalPoints", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
        [
          guide.name,
          guide.description,
          guide.difficulty,
          guide.estimatedDuration,
          guide.status,
          guide.language,
          guide.totalPoints,
        ],
      );
      const guideId = guideResult[0].id;

      for (const module of guide.modules) {
        // 2. Insert Module
        const moduleResult = await queryRunner.query(
          `INSERT INTO "modules" (name, description, "order", points, status, "guideId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, 'published', $5, NOW(), NOW()) RETURNING id`,
          [
            module.name,
            module.description,
            module.order,
            module.points,
            guideId,
          ],
        );
        const moduleId = moduleResult[0].id;

        for (const blockData of module.blocks) {
          // 3. Insert Block
          const block = blockData as any;
          const resourceUrl = block.resourceUrl || null;
          const dynamicType = block.dynamicType || null;
          const questionType = block.questionType || null;
          const description = block.description || null;
          const feedback = block.feedback || null;

          const blockResult = await queryRunner.query(
            `INSERT INTO "blocks" (type, "order", statement, description, "resourceUrl", points, feedback, "dynamic_type", "question_type", "moduleId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
            [
              block.type,
              block.order,
              block.statement,
              description,
              resourceUrl,
              block.points,
              feedback,
              dynamicType,
              questionType,
              moduleId,
            ],
          );
          const blockId = blockResult[0].id;

          // 4. Insert Answers if available
          if (block.answers && block.answers.length > 0) {
            for (const answer of block.answers) {
              const answerFeedback = answer.feedback || null;
              await queryRunner.query(
                `INSERT INTO "block_answers" (text, "isCorrect", feedback, "order", "blockId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [
                  answer.text,
                  answer.isCorrect,
                  answerFeedback,
                  answer.order,
                  blockId,
                ],
              );
            }
          }

          // 5. Insert Relational Pairs if available
          if (block.relationalPairs && block.relationalPairs.length > 0) {
            for (const pair of block.relationalPairs) {
              await queryRunner.query(
                `INSERT INTO "relational_pairs" ("leftItem", "rightItem", "correctPair", "blockId", "createdAt", "updatedAt")
                       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [pair.leftItem, pair.rightItem, pair.correctPair, blockId],
              );
            }
          }
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const guideNames = [
      "Importancia del agua y sus propiedades",
      "Uso eficiente del agua en el hogar",
      "Gestión sostenible del agua para empresas",
      "Futuro de la sostenibilidad hídrica",
    ];

    await queryRunner.query(
      `DELETE FROM "guide" WHERE name IN ($1, $2, $3, $4)`,
      guideNames,
    );
  }
}
