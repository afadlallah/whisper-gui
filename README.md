# Whisper GUI

Graphical interface for OpenAI's Whisper speech recognition model, built with SvelteKit and Tailwind CSS.

Currently designed to work on Windows only.

## Features

- Transcribe audio & video files using Whisper
- Customizable transcription options
- Support for all languages and models
- All Whisper CLI options available
- Real-time processing status updates
- Whisper binary included (Windows executable)

## Getting Started

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/afadlallah/whisper-gui.git
   cd whisper-gui
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser to use the application.

### Usage

1. Upload an audio or video file through the interface

2. Adjust transcription options if desired (default settings are pre-configured to Whisper's recommended parameters)

3. Click "Start Task" to begin processing

4. View transcription results in the browser or in the "WhisperOutput" folder on your desktop

### Advanced Options

The application provides various advanced options for fine-tuning the transcription process. These can be accessed by clicking the "Advanced Options" button on the main interface.

## Planned Features

- [ ] Batch processing of multiple files
- [ ] YouTube video support
- [ ] Custom output directory selection
- [ ] Support for other operating systems

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.