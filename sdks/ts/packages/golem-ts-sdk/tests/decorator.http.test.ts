import { describe } from 'vitest';
import { AgentTypeRegistry } from '../src/internal/registry/agentTypeRegistry';
import {
  AllHttpMethodsAgentClassName,
  ComplexHttpAgentClassName,
  SimpleHttpAgentClassName,
} from './testUtils';
import { AgentMethodRegistry } from '../src/internal/registry/agentMethodRegistry';

describe('Http Agent class', () => {
  function getHttpEndpoint(agentClassName: { value: string }, methodName: string) {
    const agentMethod = AgentMethodRegistry.get(agentClassName.value)?.get(methodName);

    if (!agentMethod?.httpEndpoint?.[0]) {
      throw new Error(
        `${agentClassName.value}.${methodName} method not found in AgentMethodRegistry`,
      );
    }

    return agentMethod.httpEndpoint[0];
  }

  it('should register HTTP mount details with only mount', () => {
    const simpleHttpAgent = AgentTypeRegistry.get(SimpleHttpAgentClassName);

    if (!simpleHttpAgent) {
      throw new Error('SimpleHttpAgent not found in AgentTypeRegistry');
    }

    expect(simpleHttpAgent.httpMount).toBeDefined();
    expect(simpleHttpAgent.httpMount?.pathPrefix).toEqual([
      {
        tag: 'literal',
        val: 'chats',
      },
      {
        tag: 'system-variable',
        val: 'agent-type',
      },
    ]);
  });

  it('should register HTTP endpoint details with endpoint details', () => {
    const simpleHttpAgent = AgentMethodRegistry.get(SimpleHttpAgentClassName.value)?.get('greet');

    if (!simpleHttpAgent) {
      throw new Error('SimpleHttpAgent.greet method not found in AgentMethodRegistry');
    }

    expect(simpleHttpAgent.httpEndpoint).toBeDefined();
    expect(simpleHttpAgent.httpEndpoint).toEqual([
      {
        httpMethod: { tag: 'get' },
        authDetails: undefined,
        queryVars: [],
        corsOptions: {
          allowedPatterns: [],
        },
        headerVars: [],
        pathSuffix: [
          {
            tag: 'literal',
            val: 'greet',
          },
          {
            tag: 'path-variable',
            val: {
              variableName: 'name',
            },
          },
        ],
      },
    ]);
  });

  it('should register HTTP mount details with all details', () => {
    const simpleHttpAgent = AgentTypeRegistry.get(ComplexHttpAgentClassName);

    if (!simpleHttpAgent) {
      throw new Error('SimpleHttpAgent not found in AgentTypeRegistry');
    }

    const expectedPathPrefix = [
      {
        tag: 'literal',
        val: 'chats',
      },
      {
        tag: 'system-variable',
        val: 'agent-type',
      },
      {
        tag: 'path-variable',
        val: {
          variableName: 'foo',
        },
      },
      {
        tag: 'path-variable',
        val: {
          variableName: 'bar',
        },
      },
    ];

    const expectedWebhookSuffix = [
      {
        tag: 'system-variable',
        val: 'agent-type',
      },
      {
        tag: 'literal',
        val: 'events',
      },
      {
        tag: 'path-variable',
        val: {
          variableName: 'foo',
        },
      },
      {
        tag: 'path-variable',
        val: {
          variableName: 'bar',
        },
      },
    ];

    expect(simpleHttpAgent.httpMount).toBeDefined();
    expect(simpleHttpAgent.httpMount).toEqual({
      pathPrefix: expectedPathPrefix,
      authDetails: { required: true },
      phantomAgent: true,
      corsOptions: {
        allowedPatterns: ['https://app.acme.com', 'https://staging.acme.com'],
      },
      webhookSuffix: expectedWebhookSuffix,
    });
  });

  it('should register simple HTTP endpoint details with catch all var', () => {
    const complexHttpAgent = AgentMethodRegistry.get(ComplexHttpAgentClassName.value)?.get(
      'catchAllFun',
    );

    if (!complexHttpAgent) {
      throw new Error('ComplexHttpAgent.catchAllFun method not found in AgentMethodRegistry');
    }

    expect(complexHttpAgent.httpEndpoint).toBeDefined();
    expect(complexHttpAgent.httpEndpoint).toEqual([
      {
        httpMethod: { tag: 'get' },
        authDetails: undefined,
        queryVars: [],
        corsOptions: {
          allowedPatterns: [],
        },
        headerVars: [],
        pathSuffix: [
          { tag: 'literal', val: 'greet' },
          { tag: 'path-variable', val: { variableName: 'name' } },
          { tag: 'remaining-path-variable', val: { variableName: 'filePath' } },
        ],
      },
    ]);
  });

  it('should register simple HTTP endpoint details with left over parameters in request body', () => {
    const complexHttpAgent = AgentMethodRegistry.get(ComplexHttpAgentClassName.value)?.get(
      'greetPost',
    );

    if (!complexHttpAgent) {
      throw new Error('ComplexHttpAgent.greetPost method not found in AgentMethodRegistry');
    }

    expect(complexHttpAgent.httpEndpoint).toBeDefined();
    expect(complexHttpAgent.httpEndpoint).toEqual([
      {
        httpMethod: { tag: 'post' },
        authDetails: undefined,
        queryVars: [
          {
            queryParamName: 'l',
            variableName: 'location',
          },
        ],
        corsOptions: {
          allowedPatterns: [],
        },
        headerVars: [],
        pathSuffix: [
          {
            tag: 'literal',
            val: 'greet',
          },
        ],
      },
    ]);
  });

  it('should register complex HTTP endpoint details with endpoint details', () => {
    const complexHttpAgentMetadata = AgentMethodRegistry.get(ComplexHttpAgentClassName.value)?.get(
      'greetCustom',
    );

    if (!complexHttpAgentMetadata) {
      throw new Error('SimpleHttpAgent.greet method not found in AgentMethodRegistry');
    }

    expect(complexHttpAgentMetadata.httpEndpoint).toBeDefined();
    expect(complexHttpAgentMetadata.httpEndpoint).toEqual([
      {
        httpMethod: { tag: 'custom', val: 'PROPFIND' },
        authDetails: undefined,
        queryVars: [
          {
            queryParamName: 'l',
            variableName: 'location',
          },
          {
            queryParamName: 'n',
            variableName: 'name',
          },
        ],
        corsOptions: {
          allowedPatterns: [],
        },
        headerVars: [],
        pathSuffix: [
          {
            tag: 'literal',
            val: 'greet',
          },
        ],
      },
      {
        httpMethod: { tag: 'get' },
        authDetails: { required: true },
        queryVars: [
          {
            queryParamName: 'lx',
            variableName: 'location',
          },
          {
            queryParamName: 'nm',
            variableName: 'name',
          },
        ],
        corsOptions: {
          allowedPatterns: ['*'],
        },
        headerVars: [
          {
            headerName: 'X-Foo',
            variableName: 'location',
          },
          {
            headerName: 'X-Bar',
            variableName: 'name',
          },
        ],
        pathSuffix: [
          {
            tag: 'literal',
            val: 'greet',
          },
        ],
      },
      {
        httpMethod: { tag: 'get' },
        authDetails: undefined,
        queryVars: [
          {
            queryParamName: 'l',
            variableName: 'location',
          },
          {
            queryParamName: 'n',
            variableName: 'name',
          },
        ],
        corsOptions: {
          allowedPatterns: [],
        },
        headerVars: [],
        pathSuffix: [
          {
            tag: 'literal',
            val: 'greet',
          },
        ],
      },
    ]);
  });

  it('should register all standard HTTP methods as native variants', () => {
    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'getMethod')).toEqual({
      httpMethod: { tag: 'get' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'get' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'headMethod')).toEqual({
      httpMethod: { tag: 'head' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'head' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'postMethod')).toEqual({
      httpMethod: { tag: 'post' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'post' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'putMethod')).toEqual({
      httpMethod: { tag: 'put' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'put' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'deleteMethod')).toEqual({
      httpMethod: { tag: 'delete' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'delete' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'connectMethod')).toEqual({
      httpMethod: { tag: 'connect' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'connect' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'optionsMethod')).toEqual({
      httpMethod: { tag: 'options' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'options' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'traceMethod')).toEqual({
      httpMethod: { tag: 'trace' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'trace' }],
    });

    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'patchMethod')).toEqual({
      httpMethod: { tag: 'patch' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [{ tag: 'literal', val: 'patch' }],
    });
  });

  it('should keep custom methods distinct from standard methods', () => {
    expect(getHttpEndpoint(AllHttpMethodsAgentClassName, 'propfindMethod')).toEqual({
      httpMethod: { tag: 'custom', val: 'PROPFIND' },
      authDetails: undefined,
      queryVars: [],
      corsOptions: { allowedPatterns: [] },
      headerVars: [],
      pathSuffix: [
        { tag: 'literal', val: 'propfind' },
        { tag: 'path-variable', val: { variableName: 'name' } },
      ],
    });
  });
});
