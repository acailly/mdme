/*
The MIT License (MIT)

Copyright (c) 2018 Susam Pal

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// MdMe - Self-rendering Markdown documents

(function () {
  'use strict'

  /**
   * Private namespace of MdMe. The members of the inner namespace
   * are inaccessible outside MdMe.
   *
   * @namespace inner
   */

  /**
   * The commonmark.js module is loaded and assigned to this variable.
   *
   * @type object
   * @memberof inner
   */
  var commonmark

  /**
   * Exported module of MdMe.
   *
   * @exports mdme
   */
  var mdme = {}

  /**
   * Configuration options object. Each configuration option is set as a
   * property of this object.
   *
   * @type object
   * @memberof inner
   */
  var options = {}

  /**
   * Set default configuration options.
   */
  mdme.setDefaultOptions = function () {
    options.renderOnLoad = true
    options.style = 'viewer'
    options.onRenderPage = undefined
  }

  /**
   * Read configuration options specified in `window.mdme` and
   * configure MdMe.
   *
   * @memberof inner
   */
  var setWindowOptions = function () {
    var key
    for (key in options) {
      if (typeof window !== 'undefined' &&
          typeof window.mdme !== 'undefined' &&
          typeof window.mdme[key] !== 'undefined') {
        options[key] = window.mdme[key]
      }
    }
  }

  /**
   * Set configuration option.
   *
   * @param {string} key - Configuration option name
   * @param {object} val - Configuration value object
   */
  mdme.setOption = function (key, val) {
    options[key] = val
  }

  /**
   * Load JS in browser environment.
   *
   * @param {string} url - URL of JavaScript file.
   * @memberof inner
   */
  var loadjs = function (url) {
    var script = window.document.createElement('script')
    script.src = url
    window.document.head.appendChild(script)
  }

  /**
   * A map of available CSS styles.
   *
   * @enum {string}
   * @memberof inner
   */
  var styles = {
    /** White pane on gray background */
    viewer: [
      'body {',
      '  color: #333333;',
      '}',
      'h1, h2, h3, h4, h5, h6, h7 {',
      '  margin-bottom: 0.5em;',
      '}',
      'a:link, a:visited {',
      '  color: #0000e0;',
      '  text-decoration: underline;',
      '}',
      'a:hover, a:active {',
      '  color: #0000ff;',
      '  text-decoration: underline;',
      '}',
      '@media screen and (min-width: 40em) {',
      '  body {',
      '    background: #444;',
      '  }',
      '  main {',
      '    color: #333;',
      '    background: white;',
      '    padding: 5em 6em;',
      '    max-width: 40em;',
      '    margin: 1em auto;',
      '    box-shadow: 5px 5px 5px #222;',
      '  }',
      '}'
    ].join('\n'),

    /** Plain white background */
    plain: [
      '@media screen and (min-width: 40em) {',
      '  main {',
      '    color: #333;',
      '    max-width: 40em;',
      '    margin-left: auto;',
      '    margin-right: auto;',
      '  }',
      '}'
    ].join('\n'),

    /** No style whatsoever (browser defaults) */
    none: ''
  }

  /**
   * Render Markdown content to HTML.
   *
   * @param {string} s - Markdown content.
   *
   * @returns {string} Rendered HTML.
   */
  mdme.render = function (s) {
    var parsed = new commonmark.Parser().parse(s)
    var result = new commonmark.HtmlRenderer().render(parsed)
    return result
  }

  /**
   * Set page to display the rendered content as HTML.
   */
  mdme.renderPage = function () {
    // Read input text.
    var inputElement = window.document.getElementsByTagName('textarea')[0]
    var inputText = inputElement.value.trim()
    var outputElement = window.document.createElement('main')
    var title

    // Set title if it is not specified explicitly.
    if (typeof window.document.title === 'undefined' ||
        window.document.title === '') {
      title = inputText.split('\n', 1)[0].replace(/^\s*#*\s*|\s*#*\s*$/g, '')
      window.document.title = title
    }

    // Replace the input element with the output element.
    inputElement.remove()
    window.document.body.appendChild(outputElement)

    // Set stylesheet.
    var styleElement = window.document.createElement('style')
    var css = styles[options.style]
    styleElement.appendChild(window.document.createTextNode(css))
    window.document.head.appendChild(styleElement)

    // Make commonmark available as a local variable. This ensures that
    // we can use this local variable in browser as well as in Node.js.
    commonmark = window.commonmark

    // Render the output.
    outputElement.innerHTML = mdme.render(inputText)

    // Invoke onRenderPage callback (if configured).
    if (typeof options.onRenderPage !== 'undefined') {
      options.onRenderPage()
    }
  }

  /**
   * Set up dependencies and set page.
   */
  mdme.main = function () {
    mdme.setDefaultOptions()

    if (typeof window !== 'undefined') {
      setWindowOptions()

      loadjs('https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.28.1/commonmark.js')

      if (options.renderOnLoad) {
        window.onload = mdme.renderPage
      }

      window.mdme = mdme
    } else {
      commonmark = require('commonmark')
      module.exports = mdme
    }
  }

  mdme.main()
})()
