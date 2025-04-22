import { defineConfig } from "orval";

export default defineConfig({
	goAuth: {
		input: {
			target: `${process.env.VITE_API_URL || "http://localhost:8080"}/swagger/doc.json`,
		},
		output: {
			mode: "tags-split",
			target: "./src/api",
			schemas: "./src/api/models",
			client: "react-query",
			override: {
				mutator: {
					path: "./src/api/mutator/custom-instance.ts",
					name: "customInstance",
				},
				query: {
					useQuery: true,
					useInfinite: false,
					useInfiniteQueryParam: "limit",
				},
			},
		},
		hooks: {
			afterAllFilesWrite: [
				'npx biome format --write "./src/api/**/*.{ts,tsx}"',
			],
		},
	},
});
