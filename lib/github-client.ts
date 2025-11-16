export interface GithubCommit {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
  author?: {
    login: string
  }
}

export interface GithubPullRequest {
  number: number
  title: string
  state: string
  created_at: string
  updated_at: string
  html_url: string
}

export class GitHubClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private getHeaders() {
    return {
      Authorization: `token ${this.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    }
  }

  async getRecentCommits(userName: string): Promise<GithubCommit[]> {
    try {
      // Search API has strict requirements and fails on partial usernames
      const url = `https://api.github.com/users/${userName}/repos?sort=updated&per_page=5`

      console.log('[v0] GitHub repos URL:', url)

      const reposResponse = await fetch(url, {
        headers: this.getHeaders(),
      })

      if (!reposResponse.ok) {
        console.error('[v0] GitHub user not found:', userName)
        return []
      }

      const repos = await reposResponse.json()
      if (!Array.isArray(repos) || repos.length === 0) {
        return []
      }

      // Get commits from first few repos
      const commits: GithubCommit[] = []
      for (const repo of repos.slice(0, 2)) {
        const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?author=${userName}&per_page=5`
        
        const commitsResponse = await fetch(commitsUrl, {
          headers: this.getHeaders(),
        })

        if (commitsResponse.ok) {
          const repoCommits = await commitsResponse.json()
          commits.push(...(Array.isArray(repoCommits) ? repoCommits : []))
        }
      }

      return commits
    } catch (error) {
      console.error('[v0] Error fetching GitHub commits:', error)
      return []
    }
  }

  async getActivePullRequests(userName: string): Promise<GithubPullRequest[]> {
    try {
      const url = `https://api.github.com/search/issues?q=type:pr state:open author:${userName}&sort=updated&order=desc&per_page=10`

      console.log('[v0] GitHub PR URL:', url)

      const response = await fetch(url, {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        console.error('[v0] GitHub search failed with status:', response.status)
        return []
      }

      const data = await response.json()
      return (data.items || []) as GithubPullRequest[]
    } catch (error) {
      console.error('[v0] Error fetching GitHub PRs:', error)
      return []
    }
  }

  formatActivitiesResponse(commits: GithubCommit[], prs: GithubPullRequest[], userName: string): string {
    let response = `**${userName}'s Recent GitHub Activity:**\n`

    if (commits.length > 0) {
      response += `\n**Recent Commits (${commits.length}):**\n`
      commits.slice(0, 5).forEach(commit => {
        const message = commit.commit.message.split('\n')[0]
        const date = new Date(commit.commit.author.date).toLocaleDateString()
        response += `- ${message} (${date})\n`
      })
    }

    if (prs.length > 0) {
      response += `\n**Open Pull Requests (${prs.length}):**\n`
      prs.slice(0, 5).forEach(pr => {
        const date = new Date(pr.updated_at).toLocaleDateString()
        response += `- #${pr.number}: ${pr.title} (${pr.state}, updated ${date})\n`
      })
    }

    if (commits.length === 0 && prs.length === 0) {
      response += `\nNo recent commits or open pull requests found for ${userName}.`
    }

    return response
  }
}
