# XP Customer Service Chatbot PRD

## Overview
This document outlines the requirements for developing a web-based customer service chatbot prototype for Xumo Play, a free ad-supported streaming service. The chatbot will utilize OpenAI's Assistants API to provide automated support for common customer inquiries based on an existing knowledge base. The prototype will demonstrate the effectiveness of AI-powered customer service to leadership.

## Project Goals
1. Create a functional web-based chatbot prototype that can run in any browser
2. Demonstrate the capabilities of OpenAI's Assistants API for customer support
3. Provide accurate responses based on the Xumo Play knowledge base
4. Present a clean, modern UI using shadcnUI components
5. Allow leadership to interact with the prototype to evaluate effectiveness

## Technical Specifications

### OpenAI Integration
- **Assistant ID**: asst_RoIAyLNoQyeCkl4v34U2iEEX
- **Documentation**: https://platform.openai.com/docs/api-reference/assistants
- **Knowledge Files**: 
  - Xumo Play KB.docx (Knowledge base)
  - Xumo_Channel_Lineup_3pg_4_2_2025.pdf (Channel lineup)

### System Instructions
The chatbot will operate with the following enhanced system instructions:

```
# XP Customer Support Assistant

You are a helpful, friendly customer service assistant for XP (Xumo Play), a free ad-supported streaming service. Your goal is to provide accurate, concise, and helpful answers to customer questions using the attached knowledge base.

## Core Responsibilities

1. Answer questions about the XP app using information from the knowledge base
2. Provide troubleshooting assistance for common issues
3. Explain features and capabilities of the XP service
4. Direct users to appropriate resources when needed

## Response Guidelines

- Use a friendly, conversational tone while remaining professional
- Keep responses concise and to the point (1-3 paragraphs when possible)
- Focus on solving the customer's immediate problem
- End interactions on a positive note with an offer to help with anything else
- When explaining technical steps, use numbered lists for clarity

## Knowledge Base Usage

- Reference the attached knowledge base files for all customer inquiries
- For questions about available channels, refer specifically to the channel lineup file (Xumo_Channel_Lineup_3pg_4_2_2025.pdf)
- If information is not in the knowledge base, do not make up answers

## Support Boundaries

- For questions specific to Xumo Stream Box, Xumo TV, Xumo Remote, or App Subscriptions (Peacock, Max, Fox News, etc..):
  * Clearly state: "I'm specifically trained to help with the Xumo Play app only . For questions about [specific device/service], please visit xumo.com/support for dedicated assistance."
  * Do not attempt to answer questions outside your knowledge domain

- For Vizio TV customers who can only access one channel:
  * Explain: "For older Vizio TVs purchased before 2017, this is expected behavior. The full XP experience is only available on newer Vizio models, while older models can only access the Best Of XP app with limited functionality."

- For technical issues or questions you cannot answer:
  * Say: "I don't have enough information to solve this specific issue. I'd be happy to create a support ticket for our advanced customer support team to investigate. Could you please provide [relevant details about the problem]?"

## Device-Specific Information

- Always ask which device the customer is using if they report an issue and haven't specified
- Provide device-specific instructions when available in the knowledge base
- Acknowledge the different user experiences across supported devices

## Common Scenarios

### Account Questions
- Emphasize that XP is free and does not require an account, login, or credit card
- Explain that there is no subscription or account to cancel

### Channel Availability
- Reference the channel lineup file to provide accurate information about available channels
- Explain that channel lineups are subject to change

### App Issues
- Recommend restarting the app and/or device as a first troubleshooting step
- Suggest checking internet connectivity for streaming issues
- Advise app updates when relevant

Remember: Your purpose is to provide excellent customer service that reflects positively on the Xumo Play brand while efficiently addressing customer concerns.
```

## User Interface Requirements

### Design Framework
- Use shadcnUI components for all UI elements (https://ui.shadcn.com/)
- Responsive design to work on desktop and mobile browsers

### Main Components
1. **Header**
   - Xumo Play logo
   - Title: "Xumo Play Customer Support"

2. **Chat Interface**
   - Chat window displaying conversation history
   - Message bubbles with clear distinction between user and assistant messages
   - Timestamp for each message
   - Visual indicator for assistant typing/processing

3. **Input Area**
   - Text input field for user messages
   - Send button
   - Optional: Voice input button

4. **Additional UI Elements**
   - Welcome message when conversation starts
   - Session reset button
   - Loading state indicators
   - Error handling messages

### User Flow
1. User visits the web app
2. System displays welcome message introducing the Xumo Play Support Assistant
3. User types and sends a question
4. System shows typing indicator while processing
5. Assistant responds based on the knowledge base
6. Conversation continues until user exits or resets
7. Create ticket for advanced repair if agent is not able to fix customer issue or doesnt know the answer.   Provide customer with ticket# (make up a 6 digit number) and a friendly message that somone will get back to you in 24-48 hours.  Please provide an email address for further troubleshooting

## Functional Requirements

### Core Functionality
1. **Conversation Management**
   - Create and maintain chat sessions using OpenAI's API
   - Store conversation history for the duration of the session
   - Allow users to reset/start a new conversation

2. **Message Processing**
   - Send user messages to OpenAI's Assistant API
   - Retrieve and display assistant responses
   - Handle API errors gracefully with user-friendly messages

3. **Knowledge Base Integration**
   - Ensure the assistant utilizes the attached knowledge files
   - Provide accurate responses for questions about:
     - Xumo Play features and capabilities
     - Device compatibility
     - Locations where Xumo Play is available 
     - Channel availability and cahnnel line up
     - Troubleshooting common issues
     - Account and subscription information

4. **Response Handling**
   - Identify when questions are outside the scope of the knowledge base
   - Provide appropriate responses for unsupported devices or services
   - Offer to create support tickets when necessary

### Error Handling
1. **API Errors**
   - Detect and handle connection issues
   - Provide retry mechanisms for failed requests
   - Display user-friendly error messages

2. **Knowledge Gaps**
   - Identify when questions cannot be answered with available information
   - Offer alternative support options
   - Suggest creating a support ticket when appropriate

## Implementation Details

### Frontend
- **Framework**: React.js
- **UI Components**: shadcnUI
- **State Management**: React Context or Redux
- **Styling**: Tailwind CSS (as used by shadcnUI)

### Backend
- **API Integration**: OpenAI Assistants API
- **Configuration**:
  - Initialize with existing Assistant ID
  - Use Thread model for conversation management
  - Implement proper error handling and retries

### API Endpoints
The frontend will need to communicate with the following OpenAI API endpoints:
1. **Create Thread**: Initialize a new conversation
2. **Add Message**: Send user message to the thread
3. **Run Assistant**: Process the message with the assistant
4. **Get Run**: Check the status of processing
5. **List Messages**: Retrieve messages after processing completes

## Development Milestones

### Phase 1: Setup & Basic Implementation
- Set up project with React and shadcnUI
- Implement OpenAI API integration
- Create basic chat interface

### Phase 2: Core Functionality
- Implement full conversation flow
- Add error handling
- Ensure knowledge base integration is working

### Phase 3: UI Refinement
- Polish user interface
- Add loading states and animations
- Implement responsive design

### Phase 4: Testing & Refinement
- Test with sample customer inquiries
- Fix any issues or edge cases
- Optimize performance

## Testing Requirements
- Test with a variety of common customer inquiries
- Verify accurate responses for questions about:
  - Available channels
  - Device compatibility
  - Common troubleshooting scenarios
  - Account-related questions
- Ensure appropriate handling of out-of-scope questions
- Test error handling and recovery

## Future Considerations (Post-Prototype)
- User authentication for personalized support
- Integration with ticket management systems
- Analytics to track common questions and satisfaction
- Multi-language support
- Voice interaction capabilities

## Delivery Requirements
- Functional web application accessible via browser
- Source code with documentation
- Setup instructions for demonstration
- Sample questions for testing