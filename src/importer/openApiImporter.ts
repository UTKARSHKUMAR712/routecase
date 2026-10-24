import { RCaseDocument, EndpointDefinition, TestCaseDefinition, HttpMethod } from '../models/types';

interface SchemaObject {
  type?: string;
  example?: unknown;
  default?: unknown;
  properties?: Record<string, SchemaObject>;
}

interface ParameterObject {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  example?: unknown;
  default?: unknown;
  type?: string;
  schema?: SchemaObject;
}

interface RequestBodyObject {
  content?: {
    'application/json'?: {
      example?: unknown;
      schema?: SchemaObject;
    };
    [mime: string]: unknown;
  };
}

interface OperationObject {
  summary?: string;
  operationId?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, { description?: string }>;
}

interface OpenApiDoc {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  servers?: Array<{ url: string }>;
  host?: string;
  basePath?: string;
  schemes?: string[];
  paths?: Record<string, Record<string, OperationObject> & { parameters?: ParameterObject[] }>;
}

const SUPPORTED_METHODS: readonly string[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/**
 * Parses and converts an OpenAPI 3.x or Swagger 2.x JSON specification into an RCaseDocument.
 */
export function convertOpenApiToRCase(rawSpec: unknown): RCaseDocument {
  if (typeof rawSpec !== 'object' || rawSpec === null) {
    throw new Error('Invalid OpenAPI specification: root must be a JSON object.');
  }

  const spec = rawSpec as OpenApiDoc;

  // 1. Suite name from info.title
  const title = spec.info?.title || 'Imported API Suite';

  // 2. Derive baseUrl
  let baseUrl = 'http://localhost:3000';
  if (spec.servers && spec.servers.length > 0 && spec.servers[0].url) {
    baseUrl = spec.servers[0].url;
  } else if (spec.host) {
    const scheme = spec.schemes && spec.schemes.length > 0 ? spec.schemes[0] : 'http';
    const basePath = spec.basePath || '';
    baseUrl = `${scheme}://${spec.host}${basePath}`;
  }

  // Normalize baseUrl: remove trailing slash if present
  if (baseUrl.endsWith('/') && baseUrl.length > 1) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const tests: EndpointDefinition[] = [];

  // 3. Process paths
  if (spec.paths && typeof spec.paths === 'object') {
    for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
      if (!pathItem || typeof pathItem !== 'object') {
        continue;
      }

      const commonParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];

      for (const methodKey of SUPPORTED_METHODS) {
        const operation = (pathItem as Record<string, any>)[methodKey] as OperationObject | undefined;
        if (!operation || typeof operation !== 'object') {
          continue;
        }

        const method = methodKey.toUpperCase() as HttpMethod;
        const endpointName = operation.summary || operation.operationId || `${method} ${pathKey}`;

        const opParams = Array.isArray(operation.parameters) ? operation.parameters : [];
        const allParams = [...commonParams, ...opParams];

        // Path parameters
        const paramsMap: Record<string, string | number | boolean> = {};
        for (const p of allParams) {
          if (p.in === 'path') {
            paramsMap[p.name] = resolveParamExample(p, 'sample');
          }
        }

        // Query parameters
        const queryMap: Record<string, string | number | boolean> = {};
        for (const p of allParams) {
          if (p.in === 'query') {
            queryMap[p.name] = resolveParamExample(p, 'test');
          }
        }

        // Case headers
        const headersMap: Record<string, string> = {};
        for (const p of allParams) {
          if (p.in === 'header') {
            headersMap[p.name] = String(resolveParamExample(p, 'test'));
          }
        }

        // Request Body (OpenAPI 3.x or Swagger 2.x)
        let bodyExample: unknown = undefined;
        if (operation.requestBody?.content?.['application/json']) {
          const jsonContent = operation.requestBody.content['application/json'];
          bodyExample = jsonContent.example ?? jsonContent.schema?.example ?? generateSampleFromSchema(jsonContent.schema);
        } else {
          // Check Swagger 2.0 body parameter
          const bodyParam = allParams.find(p => p.in === 'body');
          if (bodyParam) {
            bodyExample = bodyParam.example ?? bodyParam.schema?.example ?? generateSampleFromSchema(bodyParam.schema);
          }
        }

        // Determine success status code (200, 201, 204, etc.)
        const responseCodes = operation.responses ? Object.keys(operation.responses) : [];
        const successCodeStr = responseCodes.find(c => /^2\d\d$/.test(c)) || '200';
        const successStatus = parseInt(successCodeStr, 10) || 200;

        // Determine error status code (400, 422, 401, etc.)
        const preferredErrors = ['400', '422', '401', '403', '404'];
        const errorCodeStr = preferredErrors.find(c => responseCodes.includes(c)) ||
          responseCodes.find(c => /^[45]\d\d$/.test(c)) ||
          '400';
        const errorStatus = parseInt(errorCodeStr, 10) || 400;

        // Build starter success test case
        const successCase: TestCaseDefinition = {
          name: `${successStatus} OK`,
          expect: {
            status: successStatus
          }
        };

        if (Object.keys(paramsMap).length > 0) {
          successCase.params = paramsMap;
        }
        if (Object.keys(queryMap).length > 0) {
          successCase.query = queryMap;
        }
        if (Object.keys(headersMap).length > 0) {
          successCase.headers = headersMap;
        }
        if (bodyExample !== undefined) {
          successCase.body = bodyExample;
        }

        // Build starter error test case
        const errorCase: TestCaseDefinition = {
          name: `${errorStatus} Error`,
          expect: {
            status: errorStatus
          }
        };

        if (Object.keys(paramsMap).length > 0) {
          // Provide invalid/empty path param or same for testing error
          errorCase.params = { ...paramsMap };
        }
        if (Object.keys(headersMap).length > 0) {
          errorCase.headers = headersMap;
        }

        const endpoint: EndpointDefinition = {
          name: endpointName,
          method,
          path: pathKey,
          success: [successCase],
          errors: [errorCase]
        };

        tests.push(endpoint);
      }
    }
  }

  return {
    $schema: 'https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json',
    name: title,
    baseUrl,
    tests
  };
}

function resolveParamExample(param: ParameterObject, fallback: string): string | number | boolean {
  if (param.example !== undefined) {
    return param.example as string | number | boolean;
  }
  if (param.default !== undefined) {
    return param.default as string | number | boolean;
  }
  if (param.schema?.example !== undefined) {
    return param.schema.example as string | number | boolean;
  }
  if (param.schema?.default !== undefined) {
    return param.schema.default as string | number | boolean;
  }

  const type = param.schema?.type || param.type;
  if (type === 'integer' || type === 'number') {
    return 1;
  }
  if (type === 'boolean') {
    return true;
  }
  return fallback;
}

function generateSampleFromSchema(schema?: SchemaObject): unknown {
  if (!schema) {
    return {};
  }
  if (schema.example !== undefined) {
    return schema.example;
  }
  if (schema.default !== undefined) {
    return schema.default;
  }

  if (schema.type === 'object' || schema.properties) {
    const result: Record<string, unknown> = {};
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.example !== undefined) {
          result[propName] = propSchema.example;
        } else if (propSchema.default !== undefined) {
          result[propName] = propSchema.default;
        } else if (propSchema.type === 'integer' || propSchema.type === 'number') {
          result[propName] = 1;
        } else if (propSchema.type === 'boolean') {
          result[propName] = true;
        } else if (propSchema.type === 'array') {
          result[propName] = [];
        } else {
          result[propName] = 'sample';
        }
      }
    }
    return result;
  }

  if (schema.type === 'array') {
    return [];
  }

  return {};
}
