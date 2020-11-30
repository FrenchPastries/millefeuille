const render = options => {
  return `<h2>Stack Trace</h2>
<pre class="stack-trace">${options.stacktrace}</pre>`
}

module.exports = render
