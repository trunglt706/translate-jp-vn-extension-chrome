# Translate JP-VN Extension

Chrome extension for quickly translating Japanese text to Vietnamese using Gemini or ChatGPT.

## Overview

This extension lets you hold `Alt` and click content on a web page to translate it.
Supported providers:

- Gemini (Google AI Studio API key)
- ChatGPT (OpenAI API key)
- Improved text extraction for Google Docs and Google Sheets cells/selections

## Key Features

- Fast translation with `Alt + Click`
- Provider switching in popup: `Gemini` <-> `ChatGPT`
- Separate API key storage per provider
- Gemini model fallback support
- Quick translation display via dialog
- Extension icon configured with `favicon.ico`

## File Structure

- `manifest.json`: extension config, permissions, host permissions, icons
- `popup.html`: popup UI for provider and API key setup
- `popup.js`: save/load provider and API keys
- `content.js`: click capture and translation API logic
- `content-chatgpt.js`: legacy reference script
- `favicon.ico`: extension icon

## Local Setup

1. Open Chrome and go to `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `translate-jp-vn` project folder
5. Click `Reload` after each code update

## API Key Configuration

1. Click the extension icon to open the popup
2. Select provider: `Gemini` or `ChatGPT`
3. Enter the matching API key
4. Click `Save Key`

Key sources:

- Gemini: `https://aistudio.google.com/api-keys`
- OpenAI: `https://platform.openai.com/api-keys`

## Usage

1. Open any page with Japanese text
2. Hold `Alt`
3. Click the target text or cell
4. Read translation in `[Gemini Translate]` or `[ChatGPT Translate]` dialog

## Notes for Google Docs / Google Sheets

- The extension prioritizes currently selected text
- It supports editable inputs/content regions
- It handles Google Sheets cells via `role="gridcell"` and `aria-label`

## Quick Troubleshooting

- Translation not working: verify that the API key is saved for the active provider.
- Translation not working: reload the extension in `chrome://extensions`.
- Gemini model errors: confirm your key has Gemini API access.
- Gemini model errors: switch to ChatGPT to compare behavior.
- Click not captured: make sure you are holding `Alt`.

## Author and Ownership

- Author: `trunglt`
- Ownership/Copyright: `trunglt`

## License

Not defined yet. You can add a `LICENSE` file for formal open-source publication.
