# context-bar

Draws the session's context window as a stacked bar above the prompt, one colour per category (system prompt, messages, memory, tools and so on), with a legend of the token count per category. Free space is shown as a dim hatched fill.

Run `/context-bar` to toggle it on or off. It starts hidden. The figures are the engine's local estimate (`$.session.usage({ breakdown: 'summary' })`), so they cost no API calls.

## Install

At the prompt of a terminal session:

```
/plugin install context-bar --marketplace thongnguyenhuu/context-bar
```

From a shell:

```
claude plugin install context-bar --marketplace thongnguyenhuu/context-bar
```
