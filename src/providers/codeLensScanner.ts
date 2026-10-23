export interface CodeLensLocation {
  line: number;
  type: 'root' | 'endpoint' | 'case';
  endpointName?: string;
  caseName?: string;
  method?: string;
}

export function findCodeLensLocations(text: string): CodeLensLocation[] {
  const locations: CodeLensLocation[] = [];

  // Root CodeLens at top of file
  locations.push({ line: 0, type: 'root' });

  const lines = text.split(/\r?\n/);
  let inTests = false;
  let inCases = false;
  let inEndpoint = false;
  let currentEndpointName: string | undefined;
  let caseBraceDepth = 0;
  let currentCaseFoundForObject = false;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];

    if (lineText.includes('"tests"') && lineText.includes('[')) {
      inTests = true;
    }

    if (!inTests) {
      continue;
    }

    // Entering an endpoint
    if (!inEndpoint && lineText.includes('{')) {
      inEndpoint = true;
    }

    // Check if entering a cases array ("success": [ or "errors": [)
    if (lineText.search(/"(success|errors)"\s*:\s*\[/) !== -1) {
      inCases = true;
      caseBraceDepth = 0;
    }

    if (inCases) {
      // Track brace depth within cases array
      const openBraces = (lineText.match(/\{/g) || []).length;
      const closeBraces = (lineText.match(/\}/g) || []).length;

      if (openBraces > 0 && caseBraceDepth === 0) {
        currentCaseFoundForObject = false;
      }

      caseBraceDepth += openBraces - closeBraces;

      // Only match test case name at top level of the test case object (depth === 1)
      if (caseBraceDepth === 1 && !currentCaseFoundForObject) {
        const caseNameMatch = lineText.match(/"name"\s*:\s*"([^"]+)"/);
        if (caseNameMatch && currentEndpointName) {
          locations.push({
            line: i,
            type: 'case',
            endpointName: currentEndpointName,
            caseName: caseNameMatch[1]
          });
          currentCaseFoundForObject = true;
        }
      }

      // Check if exiting cases array
      if (lineText.includes(']') && caseBraceDepth <= 0) {
        inCases = false;
        caseBraceDepth = 0;
      }
    } else {
      // Endpoint level
      const epNameMatch = lineText.match(/"name"\s*:\s*"([^"]+)"/);
      if (epNameMatch && !lineText.includes('"tests"')) {
        currentEndpointName = epNameMatch[1];
        locations.push({
          line: i,
          type: 'endpoint',
          endpointName: epNameMatch[1]
        });
      }
    }
  }

  return locations;
}
