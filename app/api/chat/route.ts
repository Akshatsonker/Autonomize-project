import { NextRequest, NextResponse } from 'next/server'
import { parseQuery } from '@/lib/query-parser'
import { JiraClient } from '@/lib/jira-client'
import { GitHubClient } from '@/lib/github-client'
import { generateAIResponse, generateTemplateResponse } from '@/lib/response-generator'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    console.log('[v0] Processing query:', message)

    // Parse the query
    const parsedQuery = parseQuery(message)
    console.log('[v0] Parsed query:', parsedQuery)

    // Get API credentials from environment
    const jiraUrl = process.env.JIRA_BASE_URL
    const jiraToken = process.env.JIRA_API_TOKEN
    const jiraEmail = process.env.JIRA_EMAIL
    const githubToken = process.env.GITHUB_TOKEN

    if (!jiraUrl || !jiraToken || !jiraEmail || !githubToken) {
      return NextResponse.json(
        {
          response: `⚠️ API credentials not configured. Please add the following environment variables in the Vars section:
- JIRA_BASE_URL
- JIRA_API_TOKEN
- JIRA_EMAIL
- GITHUB_TOKEN

Once configured, I'll be able to fetch team member activities from JIRA and GitHub.`,
        },
        { status: 200 }
      )
    }

    const memberName = parsedQuery.memberName || 'Team Member'

    if (!parsedQuery.memberName) {
      return NextResponse.json(
        {
          response: `I couldn't identify a team member name in your query. Try asking:
- "What is John working on?"
- "Show me Sarah's recent issues"
- "What has Mike committed this week?"`,
        },
        { status: 200 }
      )
    }

    // Initialize clients
    const jiraClient = new JiraClient(jiraUrl, jiraToken, jiraEmail)
    const githubClient = new GitHubClient(githubToken)

    let jiraResponse = ''
    let githubResponse = ''

    // Fetch data based on query type
    if (parsedQuery.queryType === 'jira' || parsedQuery.queryType === 'combined') {
      try {
        const issues = await jiraClient.getAssignedIssues(memberName)
        jiraResponse = jiraClient.formatIssuesResponse(issues, memberName)
      } catch (error) {
        jiraResponse = `Could not fetch JIRA data for ${memberName}.`
      }
    }

    if (parsedQuery.queryType === 'github' || parsedQuery.queryType === 'combined') {
      try {
        const commits = await githubClient.getRecentCommits(memberName)
        const prs = await githubClient.getActivePullRequests(memberName)
        githubResponse = githubClient.formatActivitiesResponse(commits, prs, memberName)
      } catch (error) {
        githubResponse = `Could not fetch GitHub data for ${memberName}.`
      }
    }

    // Generate response using AI or template
    let finalResponse = ''
    if (process.env.OPENAI_API_KEY) {
      finalResponse = await generateAIResponse(
        memberName,
        jiraResponse,
        githubResponse,
        message
      )
    } else {
      finalResponse = generateTemplateResponse(memberName, jiraResponse, githubResponse)
    }

    return NextResponse.json({ response: finalResponse })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
