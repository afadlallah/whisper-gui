import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

type TranscribeOptions = {
  appendPunctuations: string;
  beamSize: number;
  bestOf: number;
  clipTimestamps: number;
  compressionRatioThreshold: number;
  conditionOnPreviousText: boolean;
  device: string;
  fp16: boolean;
  hallucinationSilenceThreshold: number;
  highlightWords: boolean;
  initialPrompt: string;
  language: string;
  lengthPenalty: number;
  logprobThreshold: number;
  maxLineCount: number;
  maxLineWidth: number;
  maxWordsPerLine: number;
  model: string;
  noSpeechThreshold: number;
  outputFormat: string;
  patience: number;
  prependPunctuations: string;
  suppressTokens: string;
  task: string;
  temperature: number;
  temperatureIncrementOnFallback: number;
  threads: number;
  verbose: boolean;
  wordTimestamps: boolean;
};

export const POST: RequestHandler = async ({ request }) => {
  console.log('POST request received in /api/transcribe');
  const formData = await request.formData();
  const files = formData.getAll('file') as File[];
  console.log(`Number of files received: ${files.length}`);

  const options: TranscribeOptions = {
    appendPunctuations: formData.get('appendPunctuations') as string,
    beamSize: Number(formData.get('beamSize')),
    bestOf: Number(formData.get('bestOf')),
    clipTimestamps: Number(formData.get('clipTimestamps')),
    compressionRatioThreshold: Number(formData.get('compressionRatioThreshold')),
    conditionOnPreviousText: formData.get('conditionOnPreviousText') === 'true',
    device: formData.get('device') as string,
    fp16: formData.get('fp16') === 'true',
    hallucinationSilenceThreshold: Number(formData.get('hallucinationSilenceThreshold')),
    highlightWords: formData.get('highlightWords') === 'true',
    initialPrompt: formData.get('initialPrompt') as string,
    language: formData.get('language') as string,
    lengthPenalty: Number(formData.get('lengthPenalty')),
    logprobThreshold: Number(formData.get('logprobThreshold')),
    maxLineCount: Number(formData.get('maxLineCount')),
    maxLineWidth: Number(formData.get('maxLineWidth')),
    maxWordsPerLine: Number(formData.get('maxWordsPerLine')),
    model: formData.get('model') as string,
    noSpeechThreshold: Number(formData.get('noSpeechThreshold')),
    outputFormat: formData.get('outputFormat') as string,
    patience: Number(formData.get('patience')),
    prependPunctuations: formData.get('prependPunctuations') as string,
    suppressTokens: formData.get('suppressTokens') as string,
    task: formData.get('task') as string,
    temperature: Number(formData.get('temperature')),
    temperatureIncrementOnFallback: Number(formData.get('temperatureIncrementOnFallback')),
    threads: Number(formData.get('threads')),
    verbose: formData.get('verbose') === 'true',
    wordTimestamps: formData.get('wordTimestamps') === 'true'
  };

  const results = [];

  for (const file of files) {
    console.log(`Processing file: ${file.name}`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await transcribeFile(file.name, arrayBuffer, options);
      results.push(result);
      console.log(`Transcription result: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error(`Error transcribing file ${file.name}:`, error);
      results.push({ error: (error as Error).message });
    }
  }

  console.log(`Returning ${results.length} results`);
  return json(results);
};

function transcribeFile(
  fileName: string,
  fileBuffer: ArrayBuffer,
  options: TranscribeOptions
): Promise<{ text: string }> {
  return new Promise((resolve, reject) => {
    const whisperPath = path.join(process.cwd(), 'whisper', 'whisper.exe');
    const tempInputPath = path.join(os.tmpdir(), fileName);

    const outputDir = path.join(os.homedir(), 'Desktop', 'WhisperOutput');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const whisperArgs = [
      tempInputPath,
      '--model',
      options.model,
      '--task',
      options.task,
      '--language',
      options.language,
      '--output_format',
      options.outputFormat,
      '--device',
      options.device,
      '--threads',
      options.threads.toString(),
      '--output_dir',
      outputDir
    ];

    if (options.conditionOnPreviousText) {
      whisperArgs.push('--condition_on_previous_text', 'True');
    } else {
      whisperArgs.push('--condition_on_previous_text', 'False');
    }
    if (options.fp16) {
      whisperArgs.push('--fp16', 'True');
    } else {
      whisperArgs.push('--fp16', 'False');
    }
    if (options.highlightWords) {
      whisperArgs.push('--highlight_words', 'True');
    } else {
      whisperArgs.push('--highlight_words', 'False');
    }
    if (options.wordTimestamps) {
      whisperArgs.push('--word_timestamps', 'True');
    } else {
      whisperArgs.push('--word_timestamps', 'False');
    }
    if (options.verbose) {
      whisperArgs.push('--verbose', 'True');
    } else {
      whisperArgs.push('--verbose', 'False');
    }

    if (options.appendPunctuations)
      whisperArgs.push('--append_punctuations', options.appendPunctuations);
    if (options.beamSize) whisperArgs.push('--beam_size', options.beamSize.toString());
    if (options.bestOf) whisperArgs.push('--best_of', options.bestOf.toString());
    if (options.clipTimestamps)
      whisperArgs.push('--clip_timestamps', options.clipTimestamps.toString());
    if (options.compressionRatioThreshold)
      whisperArgs.push(
        '--compression_ratio_threshold',
        options.compressionRatioThreshold.toString()
      );
    if (options.hallucinationSilenceThreshold)
      whisperArgs.push(
        '--hallucination_silence_threshold',
        options.hallucinationSilenceThreshold.toString()
      );
    if (options.initialPrompt) whisperArgs.push('--initial_prompt', options.initialPrompt);
    if (options.lengthPenalty)
      whisperArgs.push('--length_penalty', options.lengthPenalty.toString());
    if (options.logprobThreshold)
      whisperArgs.push('--logprob_threshold', options.logprobThreshold.toString());
    if (options.maxLineCount) whisperArgs.push('--max_line_count', options.maxLineCount.toString());
    if (options.maxLineWidth) whisperArgs.push('--max_line_width', options.maxLineWidth.toString());
    if (options.maxWordsPerLine)
      whisperArgs.push('--max_words_per_line', options.maxWordsPerLine.toString());
    if (options.noSpeechThreshold)
      whisperArgs.push('--no_speech_threshold', options.noSpeechThreshold.toString());
    if (options.patience) whisperArgs.push('--patience', options.patience.toString());
    if (options.prependPunctuations)
      whisperArgs.push('--prepend_punctuations', options.prependPunctuations);
    if (options.suppressTokens) whisperArgs.push('--suppress_tokens', options.suppressTokens);
    if (options.temperature) whisperArgs.push('--temperature', options.temperature.toString());
    if (options.temperatureIncrementOnFallback)
      whisperArgs.push(
        '--temperature_increment_on_fallback',
        options.temperatureIncrementOnFallback.toString()
      );

    fs.writeFileSync(tempInputPath, Buffer.from(fileBuffer));

    console.log(`Executing Whisper command: ${whisperPath} ${whisperArgs.join(' ')}`);

    const whisperProcess = spawn(whisperPath, whisperArgs, {
      shell: true,
      windowsHide: true
    });

    let errorOutput = '';

    whisperProcess.stdout.on('data', (data) => {
      console.log(`Whisper stdout: ${data}`);
    });

    whisperProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Whisper stderr: ${data}`);
    });

    whisperProcess.on('close', (code) => {
      console.log(`Whisper process exited with code ${code}`);
      fs.unlinkSync(tempInputPath);

      if (code === 0) {
        const outputFilePath = path.join(outputDir, path.parse(fileName).name + '.txt');
        const transcription = fs.readFileSync(outputFilePath, 'utf8');
        resolve({ text: transcription.trim() });
      } else {
        reject(new Error(`Whisper process exited with code ${code}. Error: ${errorOutput}`));
      }
    });
  });
}
