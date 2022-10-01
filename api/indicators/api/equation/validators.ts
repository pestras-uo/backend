import { Validall } from "@pestras/validall";

export enum EquationsValidators {
  CREATE = 'createIndicatorEquation',
  UPDATE = 'updateIndicatorEquestion'
}

const EQ_ARGUMENT_VALIDATOR = 'indicatorEquationArgument';

new Validall(EQ_ARGUMENT_VALIDATOR, {
  $default: [],
  $each: {
    $props: {
      argument_id: { $type: 'string', $required: true, $message: 'argumentIdIsRequired' },
      variable: { $type: 'string', $required: true, $message: 'variableIsRequired' },
      value_column: { $type: 'string', $default: 'READING_VALUE' }
    }
  }
});

new Validall(EquationsValidators.CREATE, {
  equation: { $type: 'string', $required: true, $message: 'equationIsRequired' },
  clone_categories: {
    $or: [
      { $type: 'number', $enum: [0, 1], $default: 0 },
      { $type: 'boolean', $cast: 'number', $default: false }
    ]
  },
  arguments: { $ref: EQ_ARGUMENT_VALIDATOR }
});

new Validall(EquationsValidators.UPDATE, {
  equation: { $type: 'string', $required: true, $message: 'equationIsRequired' },
  clone_categories: {
    $or: [
      { $type: 'number', $enum: [0, 1], $default: 0 },
      { $type: 'boolean', $cast: 'number', $default: false }
    ]
  },
  arguments: { $ref: EQ_ARGUMENT_VALIDATOR }
});