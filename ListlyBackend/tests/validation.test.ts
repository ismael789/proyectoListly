import assert from 'node:assert/strict';
import {
  completedSchema,
  createListSchema,
  createTaskSchema,
  idSchema,
  updateTaskSchema,
} from '../src/validation.js';
import { validatePayloadAgainstRules } from '../src/metadata/validation-rules.service.js';

const mockedRules = {
  source: 'postgresql' as const,
  generatedAt: new Date().toISOString(),
  lists: {
    name: { type: 'string' as const, required: true, maxLength: 20, min: null, max: null, precision: null, scale: null },
  },
  tasks: {
    name: { type: 'string' as const, required: true, maxLength: null, min: null, max: null, precision: null, scale: null },
    quantity: { type: 'number' as const, required: true, maxLength: null, min: 1, max: 10, precision: 10, scale: 0 },
  },
};

assert.equal(createListSchema.safeParse({ name: 'Compras', category: 'Compras' }).success, true);
assert.equal(createListSchema.safeParse({ name: '   ', category: 'Compras' }).success, false);
assert.equal(createListSchema.safeParse({ name: 'Compras', category: 'Otra' }).success, false);
assert.equal(createListSchema.safeParse({ name: 'Compras', category: 'Compras', isAdmin: true }).success, false);

assert.equal(createTaskSchema.safeParse({ name: 'Leche', quantity: 2 }).success, true);
assert.equal(createTaskSchema.safeParse({ name: 'Leche', quantity: 0 }).success, false);
assert.equal(createTaskSchema.safeParse({ name: 'Leche', quantity: 1.5 }).success, false);
assert.equal(createTaskSchema.safeParse({ name: 'Leche', quantity: 'dos' }).success, false);
assert.equal(updateTaskSchema.safeParse({ completed: true }).success, false);

assert.equal(completedSchema.safeParse({ completed: true }).success, true);
assert.equal(completedSchema.safeParse({ completed: 'true' }).success, false);
assert.equal(completedSchema.safeParse({ completed: true, title: 'No permitido' }).success, false);
assert.equal(idSchema.safeParse('997d66f8-6d7b-4f39-823e-6be7f8b54b3e').success, true);
assert.equal(idSchema.safeParse('task-123').success, false);

assert.doesNotThrow(() => validatePayloadAgainstRules(mockedRules, 'lists', { name: 'Lista corta' }));
assert.throws(() => validatePayloadAgainstRules(mockedRules, 'lists', { name: 'Este nombre supera el límite' }), /caracteres/);
assert.doesNotThrow(() => validatePayloadAgainstRules(mockedRules, 'tasks', { name: 'Texto de cualquier longitud' }));
assert.doesNotThrow(() => validatePayloadAgainstRules(mockedRules, 'tasks', { quantity: 10 }));
assert.throws(() => validatePayloadAgainstRules(mockedRules, 'tasks', { quantity: 11 }), /superar/);
assert.throws(() => validatePayloadAgainstRules(mockedRules, 'tasks', { quantity: 0 }), /mayor o igual/);

console.log('Validation tests passed');
