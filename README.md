# Xumo Play Customer Support Chatbot

A modern, AI-powered customer support chatbot for Xumo Play built with Next.js, TypeScript, and OpenAI's Assistants API.

## Features

- Real-time chat interface
- AI-powered responses using OpenAI's Assistants API
- Modern, Apple-inspired UI design
- Responsive layout for all devices
- Support ticket generation
- Knowledge base integration

## Tech Stack

- **Framework**: Next.js with TypeScript
- **UI Components**: shadcnUI
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **API Integration**: OpenAI Assistants API

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_api_key_here
   OPENAI_ASSISTANT_ID=asst_RoIAyLNoQyeCkl4v34U2iEEX
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
xumo-chatbot/
├── src/
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript types
├── public/           # Static assets
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.
