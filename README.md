# Team Activity Monitor - AI Chatbot

A rapid prototype chatbot that integrates with JIRA and GitHub APIs to answer questions about team member activities.

## Features

- 🤖 AI-powered chat interface
- 📋 JIRA integration - fetch assigned issues and ticket status
- 🐙 GitHub integration - retrieve commits and pull requests
- 🔍 Natural language query parsing
- 💬 Conversational responses

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your Vercel project's environment variables (Vars section):

\`\`\`
JIRA_BASE_URL=https://your-instance.atlassian.net
JIRA_API_TOKEN=your-api-token
JIRA_EMAIL=your-email@example.com
GITHUB_TOKEN=your-github-token
OPENAI_API_KEY=your-openai-key (optional, for AI responses)
\`\`\`

### 2. Get Your API Tokens

**JIRA:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create an API token
3. Copy your instance URL and token

**GitHub:**
1. Go to https://github.com/settings/tokens
2. Create a Personal Access Token with `repo` and `read:user` scopes
3. Copy the token

**OpenAI (Optional):**
1. Go to https://platform.openai.com/api-keys
2. Create an API key
3. Copy the key

### 3. Test the Application

Example queries:
- "What is John working on?"
- "Show me Sarah's recent pull requests"
- "What has Mike committed this week?"
- "Tell me about Lisa's current activities"

## Architecture

\`\`\`
Team Activity Monitor
├── Frontend (chat-interface.tsx)
│   └── React component with message history
├── API Route (api/chat/route.ts)
│   ├── Query Parser (query-parser.ts)
│   ├── JIRA Client (jira-client.ts)
│   ├── GitHub Client (github-client.ts)
│   └── Response Generator (response-generator.ts)
└── UI Components (shadcn/ui)
\`\`\`

## Core Components

- **Query Parser**: Extracts team member names and query intent
- **JIRA Client**: Fetches assigned issues using JIRA REST API
- **GitHub Client**: Retrieves commits and PRs using GitHub REST API
- **Response Generator**: Combines data with AI or templates

## Error Handling

- Missing API credentials display helpful configuration messages
- API failures gracefully fallback to template responses
- Invalid queries are parsed with sensible defaults

## Performance Considerations

- Parallel API requests for faster response times
- Caching potential for frequently queried team members
- Concurrent request handling in the API route

## Testing Cases

✅ Query with team member name
✅ Query without member name (prompts for clarification)
✅ Query with specific platform (JIRA/GitHub)
✅ Error handling for missing credentials
✅ Error handling for invalid usernames

## Future Enhancements

- Caching layer for frequently requested data
- User authentication and authorization
- Dashboard with team metrics
- Slack bot integration
- Historical activity tracking
- Performance analytics
- Advanced query filters (date ranges, priority levels)
