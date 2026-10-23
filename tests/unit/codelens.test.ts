import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { findCodeLensLocations } from '../../src/providers/codeLensScanner';

describe('RouteCase Inline CodeLens Scanner', () => {
  it('should find root, endpoint, and individual test case line positions', () => {
    const content = `{
  "baseUrl": "http://localhost:3000",
  "tests": [
    {
      "name": "Superhero API",
      "method": "GET",
      "path": "/api/info/{name}",
      "success": [
        {
          "name": "Find Batman",
          "params": { "name": "Batman" },
          "expect": { "status": 200 }
        }
      ],
      "errors": [
        {
          "name": "Unknown Hero",
          "params": { "name": "Unknown" },
          "expect": { "status": 404 }
        }
      ]
    }
  ]
}`;

    const locations = findCodeLensLocations(content);

    // Root location at line 0
    assert.equal(locations[0].type, 'root');
    assert.equal(locations[0].line, 0);

    // Endpoint location
    const epLoc = locations.find(l => l.type === 'endpoint');
    assert.ok(epLoc);
    assert.equal(epLoc.endpointName, 'Superhero API');

    // Case locations
    const caseLocs = locations.filter(l => l.type === 'case');
    assert.equal(caseLocs.length, 2);
    assert.equal(caseLocs[0].caseName, 'Find Batman');
    assert.equal(caseLocs[0].endpointName, 'Superhero API');
    assert.equal(caseLocs[1].caseName, 'Unknown Hero');
    assert.equal(caseLocs[1].endpointName, 'Superhero API');
  });
});
