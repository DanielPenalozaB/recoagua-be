import { MigrationInterface, QueryRunner } from "typeorm";

export class EnrichEducationalGuides1769300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const guideNames = [
      "Importancia del agua y sus propiedades",
      "Uso eficiente del agua en el hogar",
      "Gestión sostenible del agua para empresas",
      "Futuro de la sostenibilidad hídrica",
    ];

    for (const name of guideNames) {
      const guide = await queryRunner.query(
        `SELECT id FROM "guide" WHERE name = $1`,
        [name],
      );
      if (guide.length > 0) {
        const guideId = guide[0].id;
        const modules = await queryRunner.query(
          `SELECT id FROM "modules" WHERE "guideId" = $1`,
          [guideId],
        );
        for (const mod of modules) {
          const blocks = await queryRunner.query(
            `SELECT id FROM "blocks" WHERE "moduleId" = $1`,
            [mod.id],
          );
          for (const block of blocks) {
            await queryRunner.query(
              `DELETE FROM "user_answer_details" WHERE "responseId" IN (SELECT id FROM "user_block_response" WHERE "blockId" = $1)`,
              [block.id],
            );
            await queryRunner.query(
              `DELETE FROM "user_block_response" WHERE "blockId" = $1`,
              [block.id],
            );
            await queryRunner.query(
              `DELETE FROM "block_answers" WHERE "blockId" = $1`,
              [block.id],
            );
            await queryRunner.query(
              `DELETE FROM "relational_pairs" WHERE "blockId" = $1`,
              [block.id],
            );
          }
          await queryRunner.query(`DELETE FROM "blocks" WHERE "moduleId" = $1`, [
            mod.id,
          ]);
          await queryRunner.query(
            `DELETE FROM "user_progress" WHERE "moduleId" = $1`,
            [mod.id],
          );
        }
        await queryRunner.query(`DELETE FROM "modules" WHERE "guideId" = $1`, [
          guideId,
        ]);
        await queryRunner.query(`DELETE FROM "guide" WHERE id = $1`, [guideId]);
      }
    }

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
                statement: "El agua: recurso fundamental para la vida",
                description:
                  "El agua es una sustancia líquida desprovista de olor, sabor y color, que existe en estado más o menos puro en la naturaleza. Cubre el 71% de la superficie de la corteza terrestre. Sin embargo, solo el 2.5% del agua del planeta es dulce, y de esa cantidad, menos del 1% está disponible para consumo humano.\n\nEl agua tiene propiedades únicas como la capilaridad, la tensión superficial y su alta capacidad calorífica, que la hacen esencial para regular el clima y sostener los ecosistemas.",
                points: 10,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "El agua dulce disponible para consumo humano representa menos del 1% del agua total del planeta.",
                points: 10,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Aunque el 71% de la Tierra está cubierta de agua, solo una fracción mínima es dulce y accesible.",
                  },
                  {
                    text: "Falso",
                    isCorrect: false,
                    order: 2,
                    feedback:
                      "Incorrecto. El agua dulce disponible es en realidad menos del 1% del total mundial.",
                  },
                ],
              },
              {
                type: "question",
                order: 3,
                statement:
                  "¿Cuál de las siguientes NO es una propiedad única del agua?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  { text: "Capilaridad", isCorrect: false, order: 1 },
                  { text: "Tensión superficial", isCorrect: false, order: 2 },
                  {
                    text: "Alta conductividad eléctrica en estado puro",
                    isCorrect: true,
                    order: 3,
                    feedback:
                      "Correcto. El agua pura es un mal conductor de electricidad. Son las sales disueltas las que permiten la conducción.",
                  },
                  {
                    text: "Alta capacidad calorífica",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
              {
                type: "quiz",
                order: 4,
                statement:
                  "El 71% de la superficie terrestre está cubierta por agua.",
                points: 15,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Los océanos y mares cubren la mayor parte de nuestro planeta.",
                  },
                  {
                    text: "Falso",
                    isCorrect: false,
                    order: 2,
                  },
                ],
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
                  "Observa cómo el agua se evapora, condensa y precipita en un ciclo continuo.",
                resourceUrl:
                  "https://www.youtube.com/watch?v=Y0vZotAI_Fs&pp=ygUZbG9zIHRyZXMgZXN0YWRvcyBkZWwgYWd1YQ%3D%3D",
                points: 5,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Cuál es el proceso por el cual el agua pasa de líquido a gas?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Evaporación",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. El sol calienta el agua de océanos y ríos, convirtiéndola en vapor de agua.",
                  },
                  { text: "Condensación", isCorrect: false, order: 2 },
                  { text: "Precipitación", isCorrect: false, order: 3 },
                  { text: "Infiltración", isCorrect: false, order: 4 },
                ],
              },
              {
                type: "question",
                order: 3,
                statement:
                  "¿En qué etapa del ciclo hidrológico el vapor de agua forma nubes?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  { text: "Evaporación", isCorrect: false, order: 1 },
                  {
                    text: "Condensación",
                    isCorrect: true,
                    order: 2,
                    feedback:
                      "Correcto. Cuando el vapor de agua se enfría en la atmósfera, se condensa formando gotas que crean las nubes.",
                  },
                  { text: "Precipitación", isCorrect: false, order: 3 },
                  { text: "Escorrentía", isCorrect: false, order: 4 },
                ],
              },
              {
                type: "interactive",
                order: 4,
                statement:
                  "Empareja cada etapa del ciclo hidrológico con su descripción correcta.",
                dynamicType: "matching",
                points: 15,
                relationalPairs: [
                  {
                    leftItem: "Evaporación",
                    rightItem: "El agua se convierte en vapor por el calor del sol",
                    correctPair: true,
                  },
                  {
                    leftItem: "Condensación",
                    rightItem:
                      "El vapor de agua se enfría y forma nubes",
                    correctPair: true,
                  },
                  {
                    leftItem: "Precipitación",
                    rightItem: "El agua cae como lluvia, nieve o granizo",
                    correctPair: true,
                  },
                  {
                    leftItem: "Infiltración",
                    rightItem:
                      "El agua penetra en el suelo y alimenta acuíferos",
                    correctPair: true,
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
                statement: "¿Dónde se consume más agua en el hogar?",
                description:
                  "El baño y la cocina son las zonas de mayor consumo de agua en un hogar. Una ducha de 5 minutos consume aproximadamente 100 litros, mientras que un baño de inmersión puede usar hasta 300 litros.\n\nCerrar el grifo mientras te cepillas los dientes puede ahorrar hasta 4 litros de agua por minuto. Pequeños cambios en los hábitos diarios pueden generar un ahorro significativo.",
                points: 5,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Es mejor tomar un baño de inmersión que una ducha rápida para ahorrar agua?",
                points: 10,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: false,
                    order: 1,
                    feedback:
                      "Incorrecto. Un baño de inmersión consume hasta 300 litros, mientras que una ducha de 5 minutos usa aproximadamente 100 litros.",
                  },
                  {
                    text: "Falso",
                    isCorrect: true,
                    order: 2,
                    feedback:
                      "Correcto. La ducha rápida es mucho más eficiente que el baño de inmersión.",
                  },
                ],
              },
              {
                type: "question",
                order: 3,
                statement:
                  "¿Cuántos litros de agua se pueden ahorrar al cerrar el grifo mientras te cepillas los dientes (por minuto)?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  { text: "1 litro", isCorrect: false, order: 1 },
                  {
                    text: "4 litros",
                    isCorrect: true,
                    order: 2,
                    feedback:
                      "Correcto. Un grifo abierto desperdicia aproximadamente 4 litros por minuto.",
                  },
                  { text: "10 litros", isCorrect: false, order: 3 },
                  { text: "20 litros", isCorrect: false, order: 4 },
                ],
              },
              {
                type: "question",
                order: 4,
                statement:
                  "¿Cuál de estas acciones ahorra MÁS agua en la cocina?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Lavar platos bajo el grifo abierto",
                    isCorrect: false,
                    order: 1,
                  },
                  {
                    text: "Usar el lavavajillas a carga completa",
                    isCorrect: true,
                    order: 2,
                    feedback:
                      "Correcto. Un lavavajillas eficiente a carga completa usa menos agua que lavar a mano con el grifo abierto.",
                  },
                  {
                    text: "Enjuagar verduras bajo el grifo",
                    isCorrect: false,
                    order: 3,
                  },
                  {
                    text: "Descongelar alimentos con agua corriente",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
              {
                type: "quiz",
                order: 5,
                statement:
                  "Una lavadora moderna puede usar hasta un 50% menos de agua que los modelos antiguos.",
                points: 5,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Los electrodomésticos con etiqueta de eficiencia energética consumen significativamente menos agua.",
                  },
                  { text: "Falso", isCorrect: false, order: 2 },
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
                statement: "El impacto silencioso de las fugas",
                description:
                  "Un grifo goteando puede desperdiciar más de 30 litros de agua al día, lo que equivale a más de 10,000 litros al año. Las fugas silenciosas en inodoros pueden ser aún peores, desperdiciando hasta 200 litros diarios sin que lo notes.\n\nDetectar y reparar fugas a tiempo es una de las formas más efectivas de ahorrar agua en el hogar.",
                points: 5,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "Un grifo goteando puede desperdiciar más de 30 litros de agua al día.",
                points: 10,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Aunque parezca poco, las gotas constantes suman una cantidad enorme de agua desperdiciada.",
                  },
                  { text: "Falso", isCorrect: false, order: 2 },
                ],
              },
              {
                type: "question",
                order: 3,
                statement:
                  "¿Cómo puedes detectar una fuga silenciosa en el inodoro?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Poniendo colorante alimentario en el tanque y esperando",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Si el colorante aparece en la taza sin descargar, hay una fuga en la válvula.",
                  },
                  {
                    text: "Escuchando con mucha atención",
                    isCorrect: false,
                    order: 2,
                  },
                  {
                    text: "Revisando la factura del agua únicamente",
                    isCorrect: false,
                    order: 3,
                  },
                  {
                    text: "No es posible detectarla",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
              {
                type: "interactive",
                order: 4,
                statement:
                  "Empareja cada dispositivo ahorrador con su beneficio principal.",
                dynamicType: "matching",
                points: 20,
                relationalPairs: [
                  {
                    leftItem: "Grifo con sensor",
                    rightItem:
                      "Evita el desperdicio cerrándose automáticamente",
                    correctPair: true,
                  },
                  {
                    leftItem: "Inodoro de doble descarga",
                    rightItem:
                      "Permite elegir entre descarga parcial o completa",
                    correctPair: true,
                  },
                  {
                    leftItem: "Aireador de grifo",
                    rightItem:
                      "Reduce el caudal de agua sin perder presión",
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
                statement: "Lo que no se mide, no se puede gestionar",
                description:
                  "Una auditoría hídrica es el primer paso para cualquier estrategia de ahorro de agua empresarial. Consiste en identificar todas las fuentes de consumo, medir los volúmenes utilizados y detectar ineficiencias.\n\nLos principales puntos de consumo en una empresa suelen ser: sanitarios (40-60%), procesos productivos (20-30%), riego y limpieza (10-20%).",
                points: 10,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Cuál es el primer paso para realizar una auditoría hídrica en una empresa?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Instalar medidores en áreas clave",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Sin medición no hay datos para tomar decisiones informadas sobre el consumo.",
                  },
                  {
                    text: "Reducir el personal",
                    isCorrect: false,
                    order: 2,
                  },
                  {
                    text: "Cerrar áreas de alto consumo",
                    isCorrect: false,
                    order: 3,
                  },
                  {
                    text: "Cambiar de proveedor de agua",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
              {
                type: "question",
                order: 3,
                statement:
                  "Una auditoría hídrica solo es necesaria para empresas del sector industrial.",
                points: 15,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: false,
                    order: 1,
                    feedback:
                      "Incorrecto. Cualquier empresa, sin importar su sector, se beneficia de una auditoría hídrica.",
                  },
                  {
                    text: "Falso",
                    isCorrect: true,
                    order: 2,
                    feedback:
                      "Correcto. Oficinas, hospitales, restaurantes y todo tipo de empresas pueden optimizar su consumo de agua.",
                  },
                ],
              },
              {
                type: "quiz",
                order: 4,
                statement:
                  "¿Qué porcentaje del consumo de agua en oficinas corresponde típicamente a sanitarios?",
                points: 20,
                questionType: "multiple_choice",
                answers: [
                  { text: "10-20%", isCorrect: false, order: 1 },
                  { text: "30-40%", isCorrect: false, order: 2 },
                  {
                    text: "40-60%",
                    isCorrect: true,
                    order: 3,
                    feedback:
                      "Correcto. Los sanitarios son el principal punto de consumo de agua en edificios de oficinas.",
                  },
                  { text: "70-80%", isCorrect: false, order: 4 },
                ],
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
                type: "text",
                order: 1,
                statement: "Tecnologías para un uso más eficiente del agua",
                description:
                  "Existen múltiples tecnologías que permiten a las empresas reducir significativamente su consumo de agua: sensores de flujo para monitoreo en tiempo real, sistemas de recirculación para reutilizar agua de procesos, y sistemas de captación de agua lluvia para riego y limpieza.\n\nEl agua gris (proveniente de lavamanos y duchas) puede ser tratada y reutilizada para usos que no requieren agua potable.",
                points: 10,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Cuál de estas tecnologías permite reutilizar agua en una empresa?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Sistemas de recirculación",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Los sistemas de recirculación tratan y reutilizan agua de procesos industriales.",
                  },
                  {
                    text: "Grifos manuales estándar",
                    isCorrect: false,
                    order: 2,
                  },
                  {
                    text: "Tuberías de cobre",
                    isCorrect: false,
                    order: 3,
                  },
                  {
                    text: "Tanques de almacenamiento abiertos",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
              {
                type: "question",
                order: 3,
                statement:
                  "El agua gris (de lavamanos y duchas) puede tratarse y reutilizarse para riego.",
                points: 15,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Con tratamiento adecuado, el agua gris es segura para riego y limpieza.",
                  },
                  { text: "Falso", isCorrect: false, order: 2 },
                ],
              },
              {
                type: "interactive",
                order: 4,
                statement:
                  "Empareja cada tecnología con su aplicación principal.",
                dynamicType: "matching",
                points: 20,
                relationalPairs: [
                  {
                    leftItem: "Sensores de flujo",
                    rightItem: "Monitoreo del consumo en tiempo real",
                    correctPair: true,
                  },
                  {
                    leftItem: "Sistemas de recirculación",
                    rightItem: "Reutilización de agua de procesos",
                    correctPair: true,
                  },
                  {
                    leftItem: "Captación de agua lluvia",
                    rightItem: "Agua para riego y limpieza de áreas comunes",
                    correctPair: true,
                  },
                ],
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
                statement: "Estrés hídrico: un desafío global creciente",
                description:
                  "El estrés hídrico ocurre cuando la demanda de agua supera la cantidad disponible o cuando su calidad impide su uso. Según la ONU, aproximadamente el 50% de la población mundial enfrenta estrés hídrico severo al menos un mes al año.\n\nEl cambio climático agrava esta situación al alterar los patrones de precipitación, derretir glaciares y aumentar la frecuencia de sequías e inundaciones.",
                points: 5,
              },
              {
                type: "video",
                order: 2,
                statement:
                  "El impacto ambiental en los ecosistemas acuáticos.",
                resourceUrl:
                  "https://www.youtube.com/watch?v=PzpAgqRsH-A&pp=ygU0SW1wYWN0byBkZSBsb3MgcGzDoXN0aWNvcyBlbiBsb3MgZWNvc2lzdGVtYXMgbWFyaW5vcw%3D%3D",
                points: 5,
              },
              {
                type: "question",
                order: 3,
                statement:
                  "¿Qué porcentaje de la población mundial enfrenta estrés hídrico al menos un mes al año?",
                points: 20,
                questionType: "multiple_choice",
                answers: [
                  { text: "10%", isCorrect: false, order: 1 },
                  { text: "25%", isCorrect: false, order: 2 },
                  {
                    text: "50%",
                    isCorrect: true,
                    order: 3,
                    feedback:
                      "Correcto. Según datos de la ONU, cerca de la mitad de la población mundial experimenta estrés hídrico severo.",
                  },
                  { text: "75%", isCorrect: false, order: 4 },
                ],
              },
              {
                type: "question",
                order: 4,
                statement:
                  "El cambio climático solo afecta la disponibilidad de agua en zonas desérticas.",
                points: 20,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: false,
                    order: 1,
                    feedback:
                      "Incorrecto. El cambio climático afecta patrones de lluvia, glaciares y niveles freáticos en todo el mundo.",
                  },
                  {
                    text: "Falso",
                    isCorrect: true,
                    order: 2,
                    feedback:
                      "Correcto. Sus efectos se sienten globalmente: sequías, inundaciones y derretimiento de glaciares afectan regiones diversas.",
                  },
                ],
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
                statement: "Tecnologías emergentes para el agua",
                description:
                  "La desalinización por ósmosis inversa permite obtener agua potable del mar con menor consumo energético que métodos tradicionales. La nanotecnología se investiga para crear filtros capaces de eliminar contaminantes a nivel molecular.\n\nEstas innovaciones, combinadas con la captación de agua lluvia y la reutilización de aguas grises, ofrecen soluciones prometedoras para enfrentar la crisis hídrica global.",
                points: 5,
              },
              {
                type: "question",
                order: 2,
                statement:
                  "¿Cuál es la principal ventaja de la desalinización por ósmosis inversa?",
                points: 15,
                questionType: "multiple_choice",
                answers: [
                  {
                    text: "Es la tecnología más económica disponible",
                    isCorrect: false,
                    order: 1,
                  },
                  {
                    text: "No requiere ningún tipo de energía",
                    isCorrect: false,
                    order: 2,
                  },
                  {
                    text: "Puede tratar agua de mar con menor impacto energético que otros métodos",
                    isCorrect: true,
                    order: 3,
                    feedback:
                      "Correcto. Aunque requiere energía, la ósmosis inversa es más eficiente que la destilación y otros métodos de desalinización.",
                  },
                  {
                    text: "Funciona sin ningún mantenimiento",
                    isCorrect: false,
                    order: 4,
                  },
                ],
              },
              {
                type: "quiz",
                order: 3,
                statement:
                  "La nanotecnología se está investigando para filtrar contaminantes del agua a nivel molecular.",
                points: 15,
                questionType: "true_false",
                answers: [
                  {
                    text: "Verdadero",
                    isCorrect: true,
                    order: 1,
                    feedback:
                      "Correcto. Los nanofiltros prometen ser capaces de eliminar virus, bacterias y contaminantes químicos del agua.",
                  },
                  { text: "Falso", isCorrect: false, order: 2 },
                ],
              },
              {
                type: "question",
                questionType: "open_ended",
                order: 4,
                statement:
                  "¿Qué acción personal te comprometes a realizar para cuidar el agua en tu hogar o comunidad?",
                points: 15,
              },
            ],
          },
        ],
      },
    ];

    for (const guide of guides) {
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

    for (const name of guideNames) {
      const guide = await queryRunner.query(
        `SELECT id FROM "guide" WHERE name = $1`,
        [name],
      );
      if (guide.length > 0) {
        await queryRunner.query(`DELETE FROM "guide" WHERE id = $1`, [
          guide[0].id,
        ]);
      }
    }
  }
}
