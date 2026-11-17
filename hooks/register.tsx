import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const isOn = atom({ plugin: 'context-bar', key: 'isOn' } as const, false)

const COMMAND = 'context-bar'

function short(tokens: number): string {
  return tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : `${tokens}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Show or hide the context window as a bar above the prompt',
    })

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($) => {
    await update($, isOn, value => !value)
    const shown = await read($, isOn)

    return { text: `Context bar ${shown ? 'shown' : 'hidden'}.` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!(await read($, isOn))) {
      return next(e)
    }

    const usage = await $.session.usage({ breakdown: 'summary' })
    const breakdown = usage.context.breakdown
    if (!breakdown || breakdown.rawMaxTokens <= 0) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const width = Math.max(10, (e.viewport?.columns ?? 80) - 2)
    const total = breakdown.rawMaxTokens

    // Cumulative edges, so the segments always sum to the bar's width.
    let acc = 0
    const segments = breakdown.categories
      .filter(c => c.kind !== 'deferred' && c.tokens > 0)
      .map(c => {
        const from = Math.round((acc / total) * width)
        acc += c.tokens
        const to = Math.min(width, Math.round((acc / total) * width))
        return { ...c, cells: Math.max(0, to - from) }
      })
      .filter(s => s.cells > 0)

    return (
      <Box flexDirection="column">
        <Text dimColor>
          Context {breakdown.percentage}% · {short(breakdown.totalTokens)} /{' '}
          {short(total)}
        </Text>
        <Box flexDirection="row">
          {segments.map(s =>
            s.kind === 'free' ? (
              <Text key={s.name} dimColor>
                {'░'.repeat(s.cells)}
              </Text>
            ) : (
              <Text key={s.name} backgroundColor={s.color}>
                {' '.repeat(s.cells)}
              </Text>
            ),
          )}
        </Box>
        <Box flexDirection="row" flexWrap="wrap" gap={2}>
          {segments.map(s => (
            <Box key={s.name} flexDirection="row">
              <Text color={s.color}>■ </Text>
              <Text dimColor>
                {s.name} {short(s.tokens)}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    )
  })
}
