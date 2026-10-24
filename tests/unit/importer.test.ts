import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { convertOpenApiToRCase } from '../../src/importer/openApiImporter';

describe('RouteCase OpenAPI / Swagger Importer', () => {
  it('should convert OpenAPI 3.0 specification correctly', () => {
    const openapiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Petstore API',
        version: '1.0.0'
      },
      servers: [
        { url: 'https://petstore.example.com/v1' }
      ],
      paths: {
        '/pets/{petId}': {
          get: {
            summary: 'Find pet by ID',
            parameters: [
              {
                name: 'petId',
                in: 'path',
                required: true,
                schema: { type: 'integer', example: 123 }
              }
            ],
            responses: {
              '200': { description: 'Pet details' },
              '404': { description: 'Pet not found' }
            }
          }
        },
        '/pets': {
          post: {
            summary: 'Create a pet',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Fido' },
                      tag: { type: 'string', example: 'dog' }
                    }
                  }
                }
              }
            },
            responses: {
              '201': { description: 'Pet created' },
              '400': { description: 'Invalid input' }
            }
          }
        }
      }
    };

    const doc = convertOpenApiToRCase(openapiSpec);
    assert.equal(doc.name, 'Petstore API');
    assert.equal(doc.baseUrl, 'https://petstore.example.com/v1');
    assert.equal(doc.tests.length, 2);

    // GET endpoint
    const getEp = doc.tests.find(t => t.method === 'GET');
    assert.ok(getEp);
    assert.equal(getEp.path, '/pets/{petId}');
    assert.equal(getEp.success?.[0].expect.status, 200);
    assert.equal(getEp.success?.[0].params?.['petId'], 123);
    assert.equal(getEp.errors?.[0].expect.status, 404);

    // POST endpoint
    const postEp = doc.tests.find(t => t.method === 'POST');
    assert.ok(postEp);
    assert.equal(postEp.success?.[0].expect.status, 201);
    assert.deepEqual(postEp.success?.[0].body, { name: 'Fido', tag: 'dog' });
    assert.equal(postEp.errors?.[0].expect.status, 400);
  });

  it('should convert Swagger 2.0 specification correctly', () => {
    const swaggerSpec = {
      swagger: '2.0',
      info: {
        title: 'Legacy Swagger API',
        version: '1.0'
      },
      host: 'api.legacy.com',
      basePath: '/v2',
      schemes: ['https'],
      paths: {
        '/items': {
          get: {
            summary: 'List items',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                type: 'integer',
                default: 20
              }
            ],
            responses: {
              '200': { description: 'List of items' }
            }
          }
        }
      }
    };

    const doc = convertOpenApiToRCase(swaggerSpec);
    assert.equal(doc.name, 'Legacy Swagger API');
    assert.equal(doc.baseUrl, 'https://api.legacy.com/v2');
    assert.equal(doc.tests.length, 1);
    assert.equal(doc.tests[0].method, 'GET');
    assert.equal(doc.tests[0].success?.[0].query?.['limit'], 20);
    assert.equal(doc.tests[0].success?.[0].expect.status, 200);
  });
});
