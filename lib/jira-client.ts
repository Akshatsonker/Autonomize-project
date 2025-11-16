export interface JiraIssue {
  key: string
  fields: {
    summary: string
    status: {
      name: string
    }
    assignee: {
      name: string
      displayName: string
    } | null
    created: string
    updated: string
  }
}

export class JiraClient {
  private baseUrl: string
  private token: string
  private email: string

  constructor(baseUrl: string, token: string, email: string) {
    this.baseUrl = baseUrl
    this.token = token
    this.email = email
  }

  private getAuthHeader() {
    const auth = Buffer.from(`${this.email}:${this.token}`).toString('base64')
    return {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    }
  }

  async getAssignedIssues(userName: string): Promise<JiraIssue[]> {
    try {
      // First try to search by displayName, fallback to userName
      const jql = `assignee in (${userName}) AND status NOT IN (Done, Closed)`
      
      // Ensure baseUrl doesn't have trailing slash
      const baseUrlClean = this.baseUrl.replace(/\/$/, '')
      const url = `${baseUrlClean}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=10`

      console.log('[v0] JIRA URL:', url)

      const response = await fetch(url, {
        headers: this.getAuthHeader(),
      })

      if (response.status === 302 || response.status === 301) {
        console.error('[v0] JIRA redirect detected - possible auth issue or invalid user')
        return []
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('[v0] JIRA API error response:', errorText)
        throw new Error(`JIRA API error: ${response.status}`)
      }

      const data = await response.json()
      return data.issues || []
    } catch (error) {
      console.error('[v0] Error fetching JIRA issues:', error)
      return []
    }
  }

  formatIssuesResponse(issues: JiraIssue[], userName: string): string {
    if (issues.length === 0) {
      return `No active JIRA tickets found for ${userName}.`
    }

    const issuesList = issues
      .map(
        issue => `
- **${issue.key}**: ${issue.fields.summary}
  Status: ${issue.fields.status.name}
  Updated: ${new Date(issue.fields.updated).toLocaleDateString()}`
      )
      .join('\n')

    return `${userName} is currently working on ${issues.length} JIRA ticket(s):\n${issuesList}`
  }
}
