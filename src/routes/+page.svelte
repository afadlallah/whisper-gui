<script>
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import {
    defaultAdvancedOptions,
    deviceOptions,
    languageOptions,
    modelOptions,
    outputFormatOptions,
    taskOptions
  } from '$lib/whisperOptions.ts';

  let files = [];
  let isProcessing = false;
  let links = '';
  let taskResults = [];

  let options = { ...defaultAdvancedOptions };

  const isAdvancedOptionsOpen = writable(false);

  let isTaskComplete = false;

  function handleFileChange(event) {
    files = Array.from(event.target.files);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    isProcessing = true;

    const formData = new FormData();

    files.forEach((file) => formData.append('file', file));
    Object.entries(options).forEach(([key, value]) => formData.append(key, value.toString()));

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Task failed');

      taskResults = await response.json();
      isTaskComplete = true;
    } catch (error) {
      console.error('Error during processing:', error);
    } finally {
      isProcessing = false;
      files = [];
    }
  }

  function toggleAdvancedOptions() {
    $isAdvancedOptionsOpen = !$isAdvancedOptionsOpen;
  }

  $: {
    if (options.bestOf < options.beamSize) options.bestOf = options.beamSize;
  }

  function handleBeamSizeChange(event) {
    options.beamSize = parseInt(event.target.value);
    if (options.bestOf < options.beamSize) options.bestOf = options.beamSize;
  }

  function handleBestOfChange(event) {
    options.bestOf = parseInt(event.target.value);
    if (options.bestOf < options.beamSize) options.beamSize = options.bestOf;
  }

  $: {
    if (options.device === 'cpu') options.fp16 = false;
  }

  function handleDeviceChange(event) {
    options.device = event.target.value;
    options.fp16 = options.device !== 'cpu';
  }

  function resetAdvancedOptions() {
    options = { ...defaultAdvancedOptions };
  }

  function startNewTask() {
    window.location.reload();
  }
</script>

<main class="container mx-auto p-4 max-w-3xl">
  <h1
    class="text-4xl font-bold mb-8 text-center text-sky-600"
    in:fly={{ y: -20, duration: 1000, easing: quintOut }}
  >
    Whisper GUI
  </h1>

  <div class="bg-white shadow-lg rounded-lg p-6 mb-8" in:fade={{ duration: 1000 }}>
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">File to Process</h2>
    <label class="block mb-4">
      <span class="sr-only">Choose file</span>
      <input
        type="file"
        on:change={handleFileChange}
        accept=".m4a,.mp3,.mp4,.mpeg,.mpga,.wav,.webm"
        class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-sky-50 file:text-sky-700
          hover:file:bg-sky-100
        "
      />
    </label>
  </div>

  <!-- <div class="bg-white shadow-lg rounded-lg p-6 mb-8" in:fade="{{ duration: 1000, delay: 200 }}">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Enter Links</h2>
    <textarea
      bind:value={links}
      placeholder="Enter YouTube Links (One Per Line)"
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
      rows="4"
    ></textarea>
  </div> -->

  <div class="bg-white shadow-lg rounded-lg p-6 mb-8" in:fade={{ duration: 1000, delay: 400 }}>
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Main Options</h2>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700" for="model">Model</label>
        <select
          bind:value={options.model}
          id="model"
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          {#each modelOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700" for="task">Task</label>
        <select
          bind:value={options.task}
          id="task"
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          {#each taskOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700" for="language">Language</label>
        <select
          bind:value={options.language}
          id="language"
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          {#each languageOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700" for="outputFormat"
          >Output Format</label
        >
        <select
          bind:value={options.outputFormat}
          id="outputFormat"
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          {#each outputFormatOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700" for="device">Device</label>
        <select
          bind:value={options.device}
          id="device"
          on:change={handleDeviceChange}
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          {#each deviceOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700" for="threads">Threads</label>
        <input
          type="number"
          bind:value={options.threads}
          id="threads"
          min="1"
          class="w-full p-2 border border-gray-300 rounded-md"
          disabled={options.device === 'cuda'}
        />
      </div>
    </div>
  </div>

  <div class="bg-white shadow-lg rounded-lg p-6 mb-8" in:fade={{ duration: 1000, delay: 600 }}>
    <button
      on:click={toggleAdvancedOptions}
      class="flex justify-between items-center w-full text-left"
    >
      <h2 class="text-2xl font-semibold text-gray-800">Advanced Options</h2>
      <svg
        class="w-6 h-6 transform transition-transform duration-200 {$isAdvancedOptionsOpen
          ? 'rotate-180'
          : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </button>

    {#if $isAdvancedOptionsOpen}
      <div transition:slide={{ duration: 300, easing: quintOut }}>
        <div class="grid gap-4 mb-4 mt-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="appendPunctuations"
              >Append Punctuations</label
            >
            <input
              type="text"
              bind:value={options.appendPunctuations}
              id="appendPunctuations"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="clipTimestamps"
              >Clip Timestamps</label
            >
            <input
              type="text"
              bind:value={options.clipTimestamps}
              id="clipTimestamps"
              placeholder="start,end,start,end,..."
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="initialPrompt"
              >Initial Prompt</label
            >
            <input
              type="text"
              bind:value={options.initialPrompt}
              id="initialPrompt"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="prependPunctuations"
              >Prepend Punctuations</label
            >
            <input
              type="text"
              bind:value={options.prependPunctuations}
              id="prependPunctuations"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="suppressTokens"
              >Suppress Tokens</label
            >
            <input
              type="text"
              bind:value={options.suppressTokens}
              id="suppressTokens"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="beamSize"
              >Beam Size</label
            >
            <input
              type="number"
              bind:value={options.beamSize}
              id="beamSize"
              min="1"
              max="10"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="bestOf">Best Of</label>
            <input
              type="number"
              bind:value={options.bestOf}
              id="bestOf"
              min="1"
              max="10"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700"
              for="compressionRatioThreshold">Compression Ratio Threshold</label
            >
            <input
              type="number"
              bind:value={options.compressionRatioThreshold}
              id="compressionRatioThreshold"
              min="0"
              step="0.1"
              max="10"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700"
              for="hallucinationSilenceThreshold">Hallucination Silence Threshold</label
            >
            <input
              type="number"
              bind:value={options.hallucinationSilenceThreshold}
              id="hallucinationSilenceThreshold"
              min="0"
              step="0.1"
              class="w-full p-2 border border-gray-300 rounded-md"
              disabled={!options.wordTimestamps}
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="lengthPenalty"
              >Length Penalty</label
            >
            <input
              type="number"
              bind:value={options.lengthPenalty}
              id="lengthPenalty"
              step="0.1"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="logprobThreshold"
              >logProb Threshold</label
            >
            <input
              type="number"
              bind:value={options.logprobThreshold}
              id="logprobThreshold"
              min="-1"
              step="0.1"
              max="1"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="maxLineCount"
              >Max Line Count</label
            >
            <input
              type="number"
              bind:value={options.maxLineCount}
              id="maxLineCount"
              min="0"
              class="w-full p-2 border border-gray-300 rounded-md"
              disabled={!options.wordTimestamps}
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="maxLineWidth"
              >Max Line Width</label
            >
            <input
              type="number"
              bind:value={options.maxLineWidth}
              id="maxLineWidth"
              min="0"
              class="w-full p-2 border border-gray-300 rounded-md"
              disabled={!options.wordTimestamps}
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="maxWordsPerLine"
              >Max Words Per Line</label
            >
            <input
              type="number"
              bind:value={options.maxWordsPerLine}
              id="maxWordsPerLine"
              min="0"
              class="w-full p-2 border border-gray-300 rounded-md"
              disabled={!options.wordTimestamps}
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="noSpeechThreshold"
              >No Speech Threshold</label
            >
            <input
              type="number"
              bind:value={options.noSpeechThreshold}
              id="noSpeechThreshold"
              min="0"
              step="0.1"
              max="1"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="patience"
              >Patience</label
            >
            <input
              type="number"
              bind:value={options.patience}
              id="patience"
              min="0"
              step="0.1"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700" for="temperature"
              >Temperature</label
            >
            <input
              type="number"
              bind:value={options.temperature}
              id="temperature"
              min="0"
              max="1"
              step="0.1"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700"
              for="temperatureIncrementOnFallback">Temperature Increment On Fallback</label
            >
            <input
              type="number"
              bind:value={options.temperatureIncrementOnFallback}
              id="temperatureIncrementOnFallback"
              min="0"
              max="1"
              step="0.1"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={options.conditionOnPreviousText}
                class="form-checkbox h-5 w-5 text-sky-600"
              />
              <span class="ml-2 text-sm text-gray-700">Condition on Previous Text</span>
            </label>

            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={options.highlightWords}
                class="form-checkbox h-5 w-5 text-sky-600"
                disabled={!options.wordTimestamps}
              />
              <span class="ml-2 text-sm text-gray-700">Highlight Words</span>
            </label>

            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={options.fp16}
                class="form-checkbox h-5 w-5 text-sky-600"
                disabled={options.device === 'cpu'}
              />
              <span class="ml-2 text-sm text-gray-700">Use FP16</span>
            </label>

            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={options.verbose}
                class="form-checkbox h-5 w-5 text-sky-600"
              />
              <span class="ml-2 text-sm text-gray-700">Verbose</span>
            </label>

            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={options.wordTimestamps}
                class="form-checkbox h-5 w-5 text-sky-600"
              />
              <span class="ml-2 text-sm text-gray-700">Word Timestamps</span>
            </label>
          </div>

          <div class="flex items-end justify-end">
            <button
              on:click={resetAdvancedOptions}
              class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <form on:submit|preventDefault={handleSubmit} enctype="multipart/form-data">
    {#if isTaskComplete}
      <button
        type="button"
        on:click={startNewTask}
        class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        New Task
      </button>
    {:else}
      <button
        type="submit"
        class="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Start Task'}
      </button>
    {/if}
  </form>

  {#if isProcessing}
    <div class="mt-8 text-center" in:fade>
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600"
      ></div>
      <p class="mt-2 text-gray-600">Transcribing your content...</p>
    </div>
  {/if}

  {#if taskResults.length > 0}
    <div class="mt-8 bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Results</h2>
      {#each taskResults as result, index}
        <div class="mb-4">
          <!-- <h3 class="text-lg font-medium text-gray-700">File {index + 1}</h3> -->
          <p class="mt-2 text-gray-600">{result.text}</p>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
  }
</style>
