export interface ParsedQuery {
  memberName: string
  queryType: 'activity' | 'jira' | 'github' | 'combined'
  timeframe?: string
}

export function parseQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase()
  
  const patterns = [
    /(?:what is|who is|show me|tell me about)\s+(\w+(?:\s+\w+)?)'?s?\s+(?:working|jira|github|activity|issues|commits|pull)/i,
    /what has\s+(\w+(?:\s+\w+)?)\s+(?:been\s+)?(?:working|commit|pr)/i,
    /(?:for|about|is)\s+(\w+(?:\s+\w+)?)'?s?\s+/i,
    /^(\w+(?:\s+\w+)?)'?s?\s+(?:recent|working|commits|activity)/i,
    /^(\w+(?:\s+\w+)?)\s+/i,
  ]

  let memberName = ''
  for (const pattern of patterns) {
    const match = query.match(pattern)
    if (match && match[1]) {
      memberName = match[1].trim()
      break
    }
  }

  // Fallback: find capitalized words (likely names)
  if (!memberName) {
    const words = query.split(/\s+/)
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '')
      if (/^[A-Z][a-z]+$/.test(cleanWord)) {
        memberName = cleanWord
        break
      }
    }
  }

  // Determine query type
  let queryType: ParsedQuery['queryType'] = 'combined'
  if (lowerQuery.includes('jira') || lowerQuery.includes('ticket') || lowerQuery.includes('issue')) {
    queryType = 'jira'
  } else if (lowerQuery.includes('github') || lowerQuery.includes('commit') || lowerQuery.includes('pull request') || lowerQuery.includes('pr')) {
    queryType = 'github'
  }

  // Extract timeframe
  let timeframe = 'recent'
  if (lowerQuery.includes('this week')) timeframe = 'week'
  if (lowerQuery.includes('today')) timeframe = 'day'
  if (lowerQuery.includes('this month')) timeframe = 'month'

  return { memberName, queryType, timeframe }
}
