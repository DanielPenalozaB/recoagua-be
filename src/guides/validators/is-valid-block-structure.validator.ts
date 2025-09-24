import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { BlockType } from 'src/blocks/enums/block-type.enum';
import { QuestionType } from 'src/blocks/enums/question-type.enum';

@ValidatorConstraint({ name: 'isValidBlockStructure', async: false })
export class IsValidBlockStructureConstraint implements ValidatorConstraintInterface {
  validate(block: any, args: ValidationArguments) {
    // Check if block is defined
    if (!block) {
      return true; // Allow empty blocks to be handled by other validators
    }

    const { type, questionType, answers, relationalPairs } = block;

    // For question blocks, validate based on question type
    if (type === BlockType.QUESTION || type === BlockType.QUIZ) {
      if (!questionType) {
        return false;
      }

      // Multiple choice and true/false should have answers
      if ([QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE].includes(questionType)) {
        return answers && answers.length > 0;
      }

      // Matching should have relational pairs
      if (questionType === QuestionType.MATCHING) {
        return relationalPairs && relationalPairs.length > 0;
      }

      // Open ended and ordering might not need specific validation
      return true;
    }

    // Non-question blocks shouldn't have question-specific fields
    if (type !== BlockType.QUESTION && type !== BlockType.QUIZ) {
      return !questionType && (!answers || answers.length === 0) && (!relationalPairs || relationalPairs.length === 0);
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Block structure is invalid for the specified type';
  }
}

// Create a decorator function for class-level validation
export function IsValidBlockStructure(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidBlockStructure',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidBlockStructureConstraint,
    });
  };
}