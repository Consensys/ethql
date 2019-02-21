import { EthqlServiceDefinition } from '@ethql/base';
import { graphql } from 'graphql';
import { EthqlPluginFactory } from '..';
import { bootstrap } from '../bootstrap';

declare module '@ethql/base' {
  interface EthqlServices {
    testService1: {};
    testService2: {};
  }

  interface EthqlServiceDefinitions {
    testService1: EthqlServiceDefinition<string[], {}>;
    testService2: EthqlServiceDefinition<string[], {}>;
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
      services: ['testService1'],
    },
  });

  expect(() =>
    bootstrap({
      config: {},
      plugins: [plugin1, plugin2],
    }),
  ).toThrow('Missing services: testService1');
});

test('bootstrap: no error when required service is present', () => {
  const core: EthqlPluginFactory = () => ({
    name: 'core',
    priority: 10,
    serviceDefinitions: {
      testService1: {
        implementation: {
          singleton: () => ({}),
        },
      },
    },
  });

  const plugin1: EthqlPluginFactory = () => ({
    name: 'plugin1',
    priority: 11,
    dependsOn: {
      services: ['testService1'],
    },
  });

  expect(() =>
    bootstrap({
      config: {},
      plugins: [core, plugin1],
    }),
  ).not.toThrow();
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
      testService1: {
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
      testService1: {
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
