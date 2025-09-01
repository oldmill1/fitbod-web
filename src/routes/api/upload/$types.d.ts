// src/routes/api/upload/$types.d.ts
import type { RequestHandler as GenericRequestHandler } from '@sveltejs/kit';

export type RequestHandler = GenericRequestHandler;

// Response types for the upload API
export interface UploadResponse {
	success: boolean;
	message?: string;
	error?: string;
	files?: ProcessedFile[];
}

export interface ProcessedFile {
	name: string;
	size: number;
	type: string;
	processedAt: string;
	analysis: {
		status: string;
		message: string;
	};
}
