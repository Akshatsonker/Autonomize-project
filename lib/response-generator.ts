import { generateText } from 'ai'

export async function generateAIResponse(
  userName: string,
  jiraData: string,
  githubData: string,
  userQuery: string
): Promise<string> {
  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `
You are a helpful assistant that summarizes team member activities from JIRA and GitHub.

Team Member: ${userName}
User Query: ${userQuery}

JIRA Information:
${jiraData}

GitHub Information:
${githubData}

Please provide a concise, friendly summary of what this team member is working on. If information is missing, mention it. Keep response under 150 words.
      `,
      temperature: 0.7,
      maxTokens: 300,
    })

    return text
  } catch (error) {
    console.error('[v0] Error generating AI response:', error)
    if (error instanceof Error && error.message.includes('credit card')) {
      console.log('[v0] AI Gateway billing required - using template fallback')
    }
    // Fallback to template-based response
    return generateTemplateResponse(userName, jiraData, githubData)
  }
}

export function generateTemplateResponse(
  userName: string,
  jiraData: string,
  githubData: string
): string {
  return `
**${userName}'s Activity Summary:**

${jiraData || 'No JIRA data available.'}

${githubData || 'No GitHub data available.'}
`
}
