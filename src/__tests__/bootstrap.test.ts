import { graphql } from 'graphql';
import { bootstrap } from '../bootstrap';
import { EthqlPluginFactory } from '../plugin';

declare module '../services' {
  interface EthqlServiceDefinitions {
    testService: EthqlServiceDefinition<string[], {}>;
  }
}

test('bootstrap: error when core plugin not loaded', () => {
  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 0,
  });

  expect(() =>
    bootstrap({
      config: {},
      plugins: [plugin1],
    }),
  ).toThrow("'core' plugin is required");
});

test('bootstrap: error when required service not present', () => {
  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 10,
  });

  const plugin2: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    dependsOn: {
      services: ['decoder'],
    },
  });

  expect(() =>
    bootstrap({
      config: {},
      plugins: [plugin1, plugin2],
    }),
  ).toThrow('Missing services: decoder');
});

test('bootstrap: services reorganised and init in right order (after)', () => {
  const order = [];

  const core: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    init: () => order.push('core'),
  });

  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 10,
    init: () => order.push('plugin1'),
  });

  const plugin2: EthqlPluginFactory = () => ({
    name: 'plugin2',
    priority: 10,
    order: {
      after: ['plugin1'],
    },
    init: () => order.push('plugin2'),
  });

  bootstrap({
    config: {},
    plugins: [plugin2, core, plugin1],
  });

  expect(order).toEqual(['core', 'plugin1', 'plugin2']);
});

test('bootstrap: services reorganised and init in right order (before)', () => {
  const order = [];

  const core: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    init: () => order.push('core'),
  });

  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 10,
    init: () => order.push('plugin1'),
  });

  const plugin2: EthqlPluginFactory = () => ({
    name: 'plugin2',
    priority: 10,
    order: {
      before: ['plugin1'],
    },
    init: () => order.push('plugin2'),
  });

  bootstrap({
    config: {},
    plugins: [plugin2, core, plugin1],
  });

  expect(order).toEqual(['core', 'plugin2', 'plugin1']);
});

test('bootstrap: services reorganised by priority', () => {
  const order = [];

  const core: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    init: () => order.push('core'),
  });

  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 11,
    init: () => order.push('plugin1'),
  });

  const plugin2: EthqlPluginFactory = () => ({
    name: 'plugin2',
    priority: 12,
    init: () => order.push('plugin2'),
  });

  bootstrap({
    config: {},
    plugins: [plugin2, plugin1, core],
  });

  expect(order).toEqual(['core', 'plugin1', 'plugin2']);
});

test('bootstrap: service configuration merged', () => {
  let config = [];

  const core: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    serviceDefinitions: {
      testService: {
        config: ['value1'],
        implementation: {
          singleton: c => (config = c),
        },
      },
    },
  });

  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 11,
    serviceDefinitions: {
      testService: {
        config: ['value2'],
      },
    },
  });

  bootstrap({
    config: {},
    plugins: [core, plugin1],
  });

  expect(config).toEqual(['value1', 'value2']);
});

test('bootstrap with wrapping resolver', async () => {
  const core: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    schema: ['extend type Query { one: String }'],
    resolvers: {
      Query: {
        one: () => 'one original',
      },
    },
  });

  const wrapper: EthqlPluginFactory = () => ({
    name: 'wrapper',
    priority: 20,
    resolvers: prev => ({
      Query: {
        one: () => `wrapped_${((prev.Query as any).one as Function)()}`,
      },
    }),
  });

  const result = bootstrap({
    config: {},
    plugins: [core, wrapper],
  });

  const resp = await graphql(result.schema, '{ one }');
  expect(resp.data.one).toBe('wrapped_one original');
});
