// src/routes/api/upload/+server.ts
import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY, MODEL } from '$env/static/private';
import OpenAI from 'openai';
import type { RequestHandler } from './$types';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

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

		// Try to parse JSON from response, handling markdown code blocks
		let parsedAnalysis;
		try {
			if (analysisText) {
				// Remove markdown code blocks if present
				const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
				parsedAnalysis = JSON.parse(cleanedText);
			} else {
				parsedAnalysis = { error: 'No response from AI' };
			}
		} catch {
			// If parsing fails, return the raw text
			parsedAnalysis = {
				rawAnalysis: analysisText,
				error: 'Could not parse structured data'
			};
		}

		return {
			success: true,
			fileName,
			type: 'workout_summary',
			analysis: parsedAnalysis,
			rawResponse: analysisText
		};
	} catch (error) {
		console.error('OpenAI analysis error:', error);
		return {
			success: false,
			fileName,
			type: 'workout_summary',
			error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

async function analyzeMuscleGroupImage(imageBuffer: ArrayBuffer, fileName: string) {
	try {
		// Convert ArrayBuffer to base64
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
							text: `Analyze this Fitbod muscle group summary image and extract the following data in exact JSON format:

							{
								"muscleGroups": "exact comma-separated list from the image (e.g., Glutes, Abductors, Calves)",
								"calories": "exact calories value (e.g., 262)",
								"caloriesUnit": "unit for calories (e.g., kcal)",
								"volume": "exact volume value (e.g., 23,700)",
								"volumeUnit": "unit for volume (e.g., lb)",
								"exercises": "exact comma-separated list of exercise names shown under the muscle images (e.g., Barbell Hip Thrust, Machine Hip Abductor, Standing Machine Calf Press)"
							}

							IMPORTANT:
							- Extract the muscle group names from the large text (like "Glutes, Abductors, Calves")
							- Get the exact calories number and its unit (kcal)
							- Get the exact volume number and its unit (lb or kg)
							- Extract the exercise names from the text below the muscle group images
							- Copy all text exactly as shown, maintaining proper spelling and formatting`
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
			max_tokens: 1000
		});

		const analysisText = response.choices[0]?.message?.content;

		// Try to parse JSON from response, handling markdown code blocks
		let parsedAnalysis;
		try {
			if (analysisText) {
				// Remove markdown code blocks if present
				const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
				parsedAnalysis = JSON.parse(cleanedText);
			} else {
				parsedAnalysis = { error: 'No response from AI' };
			}
		} catch {
			// If parsing fails, return the raw text
			parsedAnalysis = {
				rawAnalysis: analysisText,
				error: 'Could not parse structured data'
			};
		}

		return {
			success: true,
			fileName,
			type: 'muscle_groups',
			analysis: parsedAnalysis,
			rawResponse: analysisText
		};
	} catch (error) {
		console.error('OpenAI muscle group analysis error:', error);
		return {
			success: false,
			fileName,
			type: 'muscle_groups',
			error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

// Simple heuristic to determine image type based on content analysis
async function detectImageType(
	imageBuffer: ArrayBuffer,
	fileName: string
): Promise<'workout_summary' | 'muscle_groups'> {
	try {
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
							text: `Look at this Fitbod image and determine its type. Respond with ONLY one word:

							- "workout_summary" if it shows individual exercises with columns like HIGHEST WEIGHT, VOLUME, ESTIMATED STRENGTH
							- "muscle_groups" if it shows muscle group illustrations (like body diagrams) with overall workout stats like calories and volume

							Response (one word only):`
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
			max_tokens: 10
		});

		const responseText = response.choices[0]?.message?.content?.trim().toLowerCase();
		return responseText === 'muscle_groups' ? 'muscle_groups' : 'workout_summary';
	} catch (error) {
		console.error('Image type detection error:', error);
		// Default fallback based on filename or assume workout_summary
		return fileName.toLowerCase().includes('muscle') ? 'muscle_groups' : 'workout_summary';
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (!files || files.length !== 2) {
			return json(
				{
					success: false,
					error: 'Exactly 2 images are required: one workout summary and one muscle group summary'
				},
				{ status: 400 }
			);
		}

		// Validate that all files are images
		const imageFiles = files.filter((file) => {
			return file.type.startsWith('image/') && file.size > 0;
		});

		if (imageFiles.length !== 2) {
			return json(
				{
					success: false,
					error: 'Both files must be valid images'
				},
				{ status: 400 }
			);
		}

		// Process each image
		const analysisResults = [];

		for (const file of imageFiles) {
			const imageBuffer = await file.arrayBuffer();

			// Detect image type
			const imageType = await detectImageType(imageBuffer, file.name);

			// Analyze based on detected type
			let result;
			if (imageType === 'muscle_groups') {
				result = await analyzeMuscleGroupImage(imageBuffer, file.name);
			} else {
				result = await analyzeWorkoutImage(imageBuffer, file.name);
			}

			analysisResults.push(result);
		}

		// Ensure we have both types of images
		const workoutSummary = analysisResults.find((r) => r.type === 'workout_summary');
		const muscleGroups = analysisResults.find((r) => r.type === 'muscle_groups');

		if (!workoutSummary || !muscleGroups) {
			return json(
				{
					success: false,
					error: 'Please upload one workout summary image and one muscle group summary image',
					details: 'Missing required image types'
				},
				{ status: 400 }
			);
		}

		// Prepare response
		const processedFiles = analysisResults.map((result) => {
			const originalFile = imageFiles.find((f) => f.name === result.fileName);
			return {
				name: result.fileName,
				size: originalFile?.size || 0,
				type: originalFile?.type || 'image/*',
				imageType: result.type,
				receivedAt: new Date().toISOString(),
				status: result.success ? 'analyzed' : 'error',
				message: result.success ? `AI analysis completed for ${result.fileName}` : result.error,
				analysis: result.success ? result.analysis : null,
				rawResponse: result.success ? result.rawResponse : null
			};
		});

		console.log(
			'Dual image analysis completed:',
			processedFiles.map((f) => `${f.name} (${f.imageType})`)
		);

		return json({
			success: true,
			message: `Successfully analyzed both workout images with AI`,
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
