<!-- src/lib/components/UploadForm/WorkoutAnalysisResults.svelte -->
<script lang="ts">
	import styles from './UploadForm.module.scss';

	// Type definitions
	interface ProcessedFile {
		name: string;
		size: number;
		type: string;
		imageType: 'workout_summary' | 'muscle_groups';
		receivedAt: string;
		status: string;
		message: string;
		analysis: any;
		rawResponse: string;
	}

	interface UploadResult {
		success: boolean;
		message?: string;
		error?: string;
		files?: ProcessedFile[];
	}

	// Props
	interface Props {
		uploadResult: UploadResult;
		onReset: () => void;
	}

	let { uploadResult, onReset }: Props = $props();

	// Derived data
	const workoutData = $derived(uploadResult.files?.find((f: ProcessedFile) => f.imageType === 'workout_summary'));
	const muscleData = $derived(uploadResult.files?.find((f: ProcessedFile) => f.imageType === 'muscle_groups'));
</script>

{#if uploadResult.success && uploadResult.files}
	<!-- Display Analysis Results -->
	<div class={styles.analysisResults}>
		<div class={styles.workoutCard}>
			<!-- Workout Header with basic info -->
			<div class={styles.workoutHeader}>
				<h2 class={styles.workoutTitle}>Complete Workout Analysis</h2>
				<div class={styles.workoutMeta}>
					{#if workoutData?.analysis?.date}
						<span class={styles.workoutDate}>📅 {workoutData.analysis.date}</span>
					{/if}
					{#if workoutData?.analysis?.duration}
						<span class={styles.workoutDuration}>⏱️ {workoutData.analysis.duration}</span>
					{/if}
				</div>
			</div>

			<!-- Muscle Groups Summary -->
			{#if muscleData?.analysis && !muscleData.analysis.error}
				<div class={styles.muscleGroupsSection}>
					<h3 class={styles.sectionTitle}>Muscle Groups Targeted</h3>
					<div class={styles.muscleGroupsCard}>
						{#if muscleData.analysis.muscleGroups}
							<div class={styles.muscleGroups}>
								<span class={styles.muscleGroupsLabel}>Primary Focus:</span>
								<span class={styles.muscleGroupsList}>{muscleData.analysis.muscleGroups}</span>
							</div>
						{/if}

						<div class={styles.workoutStats}>
							{#if muscleData.analysis.calories}
								<div class={styles.workoutStat}>
									<span class={styles.statLabel}>Calories</span>
									<span
										class={styles.statValue}>{muscleData.analysis.calories} {muscleData.analysis.caloriesUnit || ''}</span>
								</div>
							{/if}
							{#if muscleData.analysis.volume}
								<div class={styles.workoutStat}>
									<span class={styles.statLabel}>Total Volume</span>
									<span
										class={styles.statValue}>{muscleData.analysis.volume} {muscleData.analysis.volumeUnit || ''}</span>
								</div>
							{/if}
						</div>

						{#if muscleData.analysis.exercises}
							<div class={styles.muscleGroupExercises}>
								<span class={styles.exercisesLabel}>Main Exercises:</span>
								<span class={styles.exercisesList}>{muscleData.analysis.exercises}</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Detailed Exercise Breakdown -->
			{#if workoutData?.analysis?.exercises && workoutData.analysis.exercises.length > 0}
				<div class={styles.exercisesSection}>
					<h3 class={styles.sectionTitle}>Exercise Details ({workoutData.analysis.exercises.length})</h3>
					{#each workoutData.analysis.exercises as exercise, idx}
						<div class={styles.exerciseCard}>
							<div class={styles.exerciseName}>{exercise.name}</div>
							<div class={styles.exerciseStats}>
								{#if exercise.highestWeight && exercise.highestWeight !== 'not visible'}
									<div class={styles.exerciseStat}>
										<span class={styles.statLabel}>Highest Weight</span>
										<span class={styles.statValue}>{exercise.highestWeight}</span>
									</div>
								{/if}
								{#if exercise.volume && exercise.volume !== 'not visible'}
									<div class={styles.exerciseStat}>
										<span class={styles.statLabel}>Volume</span>
										<span class={styles.statValue}>{exercise.volume}</span>
									</div>
								{/if}
								{#if exercise.estimatedStrength && exercise.estimatedStrength !== 'not visible'}
									<div class={styles.exerciseStat}>
										<span class={styles.statLabel}>Est. Strength</span>
										<span class={styles.statValue}>{exercise.estimatedStrength}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Source Files Info -->
			<div class={styles.sourceFiles}>
				<div class={styles.sourceFile}>📄 {workoutData?.name || 'Workout Summary'}</div>
				<div class={styles.sourceFile}>📄 {muscleData?.name || 'Muscle Groups'}</div>
			</div>
		</div>

		<!-- Reset button -->
		<button class={styles.resetButton} on:click={onReset}>
			Analyze Another Workout
		</button>
	</div>
{:else if !uploadResult.success}
	<!-- Error Display -->
	<div class={styles.errorCard}>
		<div class={styles.errorIcon}>❌</div>
		<div class={styles.errorTitle}>Analysis Failed</div>
		<div class={styles.errorMessage}>{uploadResult.error}</div>
		<button class={styles.retryButton} on:click={onReset}>Try Again</button>
	</div>
{/if}