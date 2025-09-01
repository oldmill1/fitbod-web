<!-- src/lib/components/UploadForm/UploadForm.svelte - UploadForm.svelte -->
<script lang="ts">
	import styles from './UploadForm.module.scss';

	// For now, just a placeholder function
	function handleClick() {
		console.log('Upload form clicked - functionality to be implemented');
	}

	// Handle keyboard events for accessibility
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<svelte:head>
	<title>Upload Workout Summary - AI Analysis</title>
	<meta name="description" content="Upload your workout summary screenshots for AI analysis" />
</svelte:head>

<div class={styles.uploadContainer}>
	<h1 class={styles.header}>Upload Your<br /> Workout Summary</h1>

	<div
		class={styles.uploadForm}
		on:click={handleClick}
		on:keydown={handleKeydown}
		role="button"
		tabindex="0"
	>
		<div class={styles.uploadPlaceholder}></div>
	</div>

	<p class={styles.footer}>Not affiliated with Fitbod.me</p>
</div>