import type { ZodSchema } from 'zod';
import { apiEndpoints, type EndpointDefinition } from './endpoints.js';

function formatZodSchema(schema: ZodSchema, depth = 0): string {
	const indent = '  '.repeat(depth);

	try {
		// Get the schema definition
		const def = (schema as any)._def;

		if (def.typeName === 'ZodObject') {
			const shape = def.shape();
			let result = '{\n';

			for (const [key, value] of Object.entries(shape)) {
				const subSchema = value as ZodSchema;
				const subDef = (subSchema as any)._def;
				const isOptional = subDef.typeName === 'ZodOptional';
				const description = subDef.description || '';

				result += `${indent}  ${key}${isOptional ? '?' : ''}: `;
				result += formatZodSchema(isOptional ? subDef.innerType : subSchema, depth + 1);
				if (description) result += ` // ${description}`;
				result += '\n';
			}

			result += `${indent}}`;
			return result;
		} else if (def.typeName === 'ZodArray') {
			return `Array<${formatZodSchema(def.type, depth)}>`;
		} else if (def.typeName === 'ZodString') {
			return 'string';
		} else if (def.typeName === 'ZodNumber') {
			return 'number';
		} else if (def.typeName === 'ZodBoolean') {
			return 'boolean';
		} else if (def.typeName === 'ZodEnum') {
			return `"${def.values.join('" | "')}"`;
		} else if (def.typeName === 'ZodLiteral') {
			return `"${def.value}"`;
		} else if (def.typeName === 'ZodUnion') {
			return def.options.map((opt: ZodSchema) => formatZodSchema(opt, depth)).join(' | ');
		} else {
			return 'any';
		}
	} catch (error) {
		return 'any';
	}
}

function generateEndpointDocs(endpoint: EndpointDefinition): string {
	let docs = `### ${endpoint.method} ${endpoint.path}\n\n`;
	docs += `**${endpoint.summary}**\n\n`;
	docs += `${endpoint.description}\n\n`;

	// Tags and Auth
	docs += `- **Tags:** ${endpoint.tags.join(', ')}\n`;
	docs += `- **Authentication:** ${endpoint.auth === 'admin' ? 'Required (Admin)' : 'None'}\n\n`;

	// Query Parameters
	if (endpoint.queryParams) {
		docs += `**Query Parameters:**\n\`\`\`typescript\n`;
		docs += formatZodSchema(endpoint.queryParams);
		docs += `\n\`\`\`\n\n`;
	}

	// Request Body
	if (endpoint.requestBody) {
		docs += `**Request Body:**\n\`\`\`typescript\n`;
		docs += formatZodSchema(endpoint.requestBody);
		docs += `\n\`\`\`\n\n`;
	}

	// Response Body
	if (endpoint.responseBody) {
		docs += `**Response:**\n\`\`\`typescript\n`;
		docs += formatZodSchema(endpoint.responseBody);
		docs += `\n\`\`\`\n\n`;
	}

	// Examples
	if (endpoint.examples) {
		docs += `**Examples:**\n\n`;

		if (endpoint.examples.request) {
			docs += `*Request:*\n\`\`\`json\n`;
			docs += JSON.stringify(endpoint.examples.request, null, 2);
			docs += `\n\`\`\`\n\n`;
		}

		if (endpoint.examples.response) {
			docs += `*Response:*\n\`\`\`json\n`;
			docs += JSON.stringify(endpoint.examples.response, null, 2);
			docs += `\n\`\`\`\n\n`;
		}
	}

	docs += `---\n\n`;
	return docs;
}

export function generateMarkdownDocs(): string {
	let markdown = `# Gift Registry API Documentation

**Version:** 2.0.0  
**Generated:** ${new Date().toISOString()}

## Overview

The Gift Registry API provides endpoints for managing a gift wishlist with privacy controls and admin management capabilities.

### Base URL
\`\`\`
http://localhost:5173/api
\`\`\`

### Authentication

- **Public Endpoints:** No authentication required
- **Admin Endpoints:** Require admin session cookie or Bearer token
  - Cookie: \`admin_session=<jwt-token>\`
  - Header: \`Authorization: Bearer <jwt-token>\`

### Features

- 🔒 **Privacy Controls:** Hide reserver names from public view
- 📊 **Pagination:** Efficient handling of large gift lists  
- 🛡️ **Type Safety:** Full TypeScript support with validation
- 👑 **Admin Controls:** Full CRUD operations for administrators

## Endpoints

`;

	// Group endpoints by tags
	const groupedEndpoints = apiEndpoints.reduce(
		(groups, endpoint) => {
			const primaryTag = endpoint.tags[0] || 'Other';
			if (!groups[primaryTag]) groups[primaryTag] = [];
			groups[primaryTag].push(endpoint);
			return groups;
		},
		{} as Record<string, EndpointDefinition[]>
	);

	// Generate docs for each group
	Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
		markdown += `## ${tag} Endpoints\n\n`;
		endpoints.forEach((endpoint) => {
			markdown += generateEndpointDocs(endpoint);
		});
	});

	// Add additional information
	markdown += `## Error Responses

All endpoints may return these common error responses:

### 400 Bad Request
\`\`\`json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "approximatePrice": ["Price must be greater than 0"]
  }
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "message": "Gift not found"
}
\`\`\`

### 409 Conflict
\`\`\`json
{
  "message": "Gift is already reserved"
}
\`\`\`

## Data Types

### Currencies
Supported currency codes: \`EUR\`, \`USD\`, \`PEN\`

### Limits
- Gift name: 1-100 characters
- Description: 1-1000 characters
- Reserver name: 1-100 characters
- Pagination limit: 1-100 items (default: 50)

## Privacy Features

When a gift is reserved with \`hideReserverName: true\`:
- Public API returns \`takenBy: null\` and \`isAnonymous: true\`
- Admin API always shows the actual reserver name
- Only admins can unreserve private reservations

## Rate Limiting

Currently no rate limiting is implemented, but consider implementing it for production use.

---

*This documentation is auto-generated from TypeScript schemas and endpoint definitions.*
`;

	return markdown;
}
