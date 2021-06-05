import message from './message'
import stacktrace from './stacktrace'

export type Options = {
  applicationName?: string
  message?: string
  stacktrace?: string
}

const render = (options: Options) => {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title>500 | Internal Server Error</title>
    <style media="screen">
      body {
        background-color: #fafafa;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        color: black;
        line-height: 24px;
        margin: 0;
      }
      pre {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
          Courier, monospace;
        overflow: auto;
        background-color: white;
        color: black;
        padding: 24px;
        border-radius: 5px;
        font-weight: bold;
        box-shadow: 0px 2px 5px 2px rgba(100, 100, 100, 0.015);
      }
      h1 {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
          Courier, monospace;
        background-color: rgb(115, 23, 68);
        padding: 12px;
        color: white;
        border-radius: 5px;
      }
      img {
        width: 50px;
        height: 50px;
      }
      header {
        padding: 12px;
        background-color: white;
        color: #050505;
        box-shadow: 0px 2px 5px 2px rgba(100, 100, 100, 0.05);
        position: sticky;
        top: 0;
      }
      header > div {
        display: flex;
        align-items: center;
        max-width: 1000px;
        margin: auto;
      }
      header > div > div {
        display: flex;
        align-items: center;
      }
      header > div > div:first-child {
        flex: 1;
      }
      header > div > a {
        font-weight: bold;
      }
      main {
        max-width: 1000px;
        margin: auto;
        padding: 24px;
      }
      .application-name {
        padding-left: 12px;
        font-size: 20px;
        font-weight: 600;
      }
      .inline-code {
        background-color: #eee;
        color: #050505;
        border-radius: 5px;
        padding: 2px 3px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
          Courier, monospace;
      }
      .column {
        display: flex;
      }
      .column > p:first-child {
        padding-right: 12px;
      }
      .column > p:last-child {
        padding-left: 12px;
      }
      .spacer {
        padding: 24px;
      }
      .small-spacer {
        padding: 6px;
      }
    </style>
  </head>
  <body>
    <header>
      <div>
        <div>
          <img src="https://avatars1.githubusercontent.com/u/44532841?s=200&v=4" />
          <p class="application-name">MilleFeuille ${
            options.applicationName
          }</p>
        </div>
        <a href="https://frenchpastries.org" target="_blank" rel="noopener">
          Documentation
        </a>
      </div>
    </header>
    <main>
      <h1>500 | Internal Server Error</h1>
      <div class="column">
        <p>
          An error occured in your application. It's possible that MilleFeuille
          was unable to treat your response as a correct object, or that your
          <span class="inline-code">Promise</span>
          returned an error.
        </p>
        <p>
          We're trying to provide you as much information as we can to help you
          debug. Did you think to transmit or correctly handle error in your
          <span class="inline-code">Promise</span> ?
        </p>
      </div>
      <div class="spacer"></div>
      ${options.message ? message(options.message) : ''}
      <div class="small-spacer"></div>
      ${options.stacktrace ? stacktrace(options.stacktrace) : ''}
      <div class="spacer"></div>
      <h2>Response Object</h2>
      <p>
        Remember, a response should be like this (or a Promise returning a
        response):
      </p>
      <pre>
{
  statusCode: number,
  headers: {
    [string]: string
  },
  body: string
}
      </pre>
    </main>
  </body>
</html>`
}

export default render
