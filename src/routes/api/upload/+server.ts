// src/routes/api/upload/+server.ts
import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY, MODEL } from '$env/static/private';
import OpenAI from 'openai';
import type { RequestHandler } from './$types';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

// Helper function to manually extract data from AI response if JSON parsing fails
function extractBasicData(text: string) {
	const extracted: any = {};

	// Extract date
	const dateMatch = text.match(/"date":\s*"([^"]+)"/);
	if (dateMatch) extracted.date = dateMatch[1];

	// Extract duration
	const durationMatch = text.match(/"duration":\s*"([^"]+)"/);
	if (durationMatch) extracted.duration = durationMatch[1];

	// Extract exercises (basic pattern matching)
	const exercises: any[] = [];
	const exerciseMatches = text.match(
		/"name":\s*"([^"]+)"[\s\S]*?"highestWeight":\s*"([^"]+)"[\s\S]*?"volume":\s*"([^"]+)"[\s\S]*?"estimatedStrength":\s*"([^"]+)"/g
	);

	if (exerciseMatches) {
		exerciseMatches.forEach((match) => {
			const parts = match.match(
				/"name":\s*"([^"]+)"[\s\S]*?"highestWeight":\s*"([^"]+)"[\s\S]*?"volume":\s*"([^"]+)"[\s\S]*?"estimatedStrength":\s*"([^"]+)"/
			);
			if (parts) {
				exercises.push({
					name: parts[1],
					highestWeight: parts[2],
					volume: parts[3],
					estimatedStrength: parts[4]
				});
			}
		});
	}

	if (exercises.length > 0) {
		extracted.exercises = exercises;
	}

	return extracted;
}

async function analyzeWorkoutImage(imageBuffer: ArrayBuffer, fileName: string) {
	try {
		// Convert ArrayBuffer to base64 - compatible with both Node.js and edge environments
		const bytes = new Uint8Array(imageBuffer);
		const base64Image = btoa(String.fromCharCode(...bytes));

		const response = await openai.chat.completions.create({
			model: MODEL || 'gpt-4o',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: `Analyze this Fitbod workout summary image and extract the following specific data in exact JSON format:

							{
								"date": "exact date from top (e.g., 8/15/25)",
								"duration": "exact duration from top (e.g., 1h4m)", 
								"exercises": [
									{
										"name": "exact exercise name (e.g., Dumbbell Rear Delt Raise)",
										"highestWeight": "exact value under HIGHEST WEIGHT (e.g., 20 lb)",
										"volume": "exact value under VOLUME (e.g., 4,000 lb)",
										"estimatedStrength": "exact value under ESTIMATED STRENGTH (e.g., 31.8 lb in 1 rep)"
									}
								]
							}

							IMPORTANT:
							- Extract the date and duration from the very top of the image (format like "8/15/25 • 1h4m")
							- For each exercise, get the exact text under each section: HIGHEST WEIGHT, VOLUME, ESTIMATED STRENGTH
							- Copy the values exactly as shown, including units (lb, kg, etc.)
							- If any value is not clearly visible, use "not visible" instead of guessing
							- Maintain the exact spelling and formatting of exercise names`
						},
						{
							type: 'image_url',
							image_url: {
								url: `data:image/jpeg;base64,${base64Image}`
							}
						}
					]
				}
			],
			max_tokens: 1500
		});

		const analysisText = response.choices[0]?.message?.content;

		// Try to extract and parse JSON from response
		let parsedAnalysis;
		try {
			// First try direct parsing
			parsedAnalysis = JSON.parse(analysisText || '{}');
		} catch {
			// If that fails, try to extract JSON from the response
			try {
				const jsonMatch = analysisText?.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					parsedAnalysis = JSON.parse(jsonMatch[0]);
				} else {
					throw new Error('No JSON found');
				}
			} catch {
				// If all parsing fails, return the raw text with better structure
				parsedAnalysis = {
					rawAnalysis: analysisText,
					error: 'Could not parse structured data',
					// Try to extract basic info manually
					extractedData: extractBasicData(analysisText || '')
				};
			}
		}

		return {
			success: true,
			fileName,
			analysis: parsedAnalysis,
			rawResponse: analysisText
		};
	} catch (error) {
		console.error('OpenAI analysis error:', error);
		return {
			success: false,
			fileName,
			error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (!files || files.length === 0) {
			return json({ success: false, error: 'No files provided' }, { status: 400 });
		}

		// Validate that all files are images
		const imageFiles = files.filter((file) => {
			return file.type.startsWith('image/') && file.size > 0;
		});

		if (imageFiles.length === 0) {
			return json({ success: false, error: 'No valid image files provided' }, { status: 400 });
		}

		// Process each image with OpenAI
		const analysisResults = [];

		for (const file of imageFiles) {
			const imageBuffer = await file.arrayBuffer();
			const result = await analyzeWorkoutImage(imageBuffer, file.name);
			analysisResults.push(result);
		}

		// Prepare response
		const processedFiles = analysisResults.map((result) => {
			return {
				name: result.fileName,
				size: imageFiles.find((f) => f.name === result.fileName)?.size || 0,
				type: imageFiles.find((f) => f.name === result.fileName)?.type || 'image/*',
				receivedAt: new Date().toISOString(),
				status: result.success ? 'analyzed' : 'error',
				message: result.success ? `AI analysis completed for ${result.fileName}` : result.error,
				analysis: result.success ? result.analysis : null,
				rawResponse: result.success ? result.rawResponse : null
			};
		});

		console.log(
			'Analysis completed for files:',
			processedFiles.map((f) => f.name)
		);

		return json({
			success: true,
			message: `Successfully analyzed ${processedFiles.length} image(s) with AI`,
			files: processedFiles
		});
	} catch (error) {
		console.error('Upload/Analysis error:', error);
		return json(
			{
				success: false,
				error: `Failed to process upload: ${error instanceof Error ? error.message : 'Unknown error'}`
			},
			{ status: 500 }
		);
	}
};
