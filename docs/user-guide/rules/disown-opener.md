# Require external links to disown opener (`disown-opener`)

`disown-opener` warns against not using `rel="noopener noreferrer"`
on `a` and `area` elements that have `target="_blank"` and link to
other origins.

## Why is this important?

Links that have `target="_blank"`, such as
`<a href="https://example.com" typeof="_blank">` constitute:

* [a security problem](https://mathiasbynens.github.io/rel-noopener/)

  When using `typeof="_blank"` the page that was linked to gains access
  to the original page's [`window.opener`](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener).
  This allows it to redirect the original page to whatever it wants,
  like for example, a phishing page designed to look like a real page
  frequently used by users, asking for login credentials (see also: [tab
  nabbing](http://www.azarask.in/blog/post/a-new-type-of-phishing-attack/)).

  By adding `ref="noopener"` (and `noreferrer` for older browsers)
  the `window.opener` reference won't be set, and thus, the ability
  for the page that was linked to from redirecting the original one
  is removed.

* [performance problem](https://jakearchibald.com/2016/performance-benefits-of-rel-noopener/)

  Most modern browser are multi-process. However, due to the
  synchronous cross-window access the DOM allows via `window.opener`,
  in most browsers pages launched via `target="_blank"` end up in the
  same process as the origin page, and that can lead to pages
  experiencing jank.

  In Chromium based browser, using `ref="noopener"` (or
  [`rel="noreferrer"`](https://blog.chromium.org/2009/12/links-that-open-in-new-processes.html)
  for older version), and thus, preventing the `window.opener` reference
  from being set, allows new pages to be opened in their own process.

  Edge is not affected by this.

Notes:

* Not all browsers [support](http://caniuse.com/#feat=rel-noopener)
   `rel="noopener"`, so in order to ensure that things work as expected
   in all browsers, for the time being, this rule requires
   `rel="noopener noreferrer"`.

* The reason why the rule does not check the same origin links by
   default is because:

  * Security isn't really a problem here.
  * When it comes to performance, making same origin links open in
     their own process actually works against optimizations that some
     browsers do in order to keep multiple same origin tabs within
     the same process (e.g. share the same event loop).

  Check [`Can the rule be configured?`](#can-the-rule-be-configured)
  section to see how the rule can be made to also check same origin
  links.

* [`noopener` and `noreferrer` only work for `a` and `area` elements](https://html5sec.org/#143).

* In the future there may be a [CSP valueless
  property](https://github.com/w3c/webappsec/issues/139) property that
  will prevent the `window.opener` reference from being set.

## What does the rule check?

By default, the rule checks if `rel="noopener noreferrer"` was specified
on `a` and `area` elements that have `target="_blank"` and link to other
origins.

Let's presume the original page is `https://example1.com`.

Examples that **trigger** the rule:

```html
<a href="http://example1.com/example.html" target="_blank">example</a>
```

```html
<a href="https://en.example1.com" target="_blank">example</a>
```

```html
<a href="//example2.com" target="_blank">example</a>
```

```html
<a href="https://example2.com" target="_blank">example</a>
```

```html
<img src="example.png" width="10" height="10" usemap="#example">
<map name="example">
    <area shape="rect" coords="0,0,5,5" href="http://example3.com/example.html" target="_blank">
</map>
```

Examples that **pass** the rule:

```html
<a href="/" target="_blank">example</a>
```

```html
<a href="example.html" target="_blank">example</a>
```

```html
<a href="https://example1.com/example.html" target="_blank">example</a>
```

```html
<a href="http://example1.com/example.html" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<a href="https://en.example1.com/example.html" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<a href="//example2.com" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<a href="https://example2.com" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<img src="example.png" width="10" height="10" usemap="#example">
<map name="example">
    <area shape="rect" coords="0,0,5,5" href="example.html" target="_blank">
</map>
```

```html
<img src="example.png" width="10" height="10" usemap="#example">
<map name="example">
    <area shape="rect" coords="0,0,5,5" href="http://example3.com/example.html" target="_blank" rel="noopener noreferrer">
</map>
```

## Can the rule be configured?

`includeSameOriginURLs` can be used to specify that same origin URLs
should also include `rel="noopener noreferrer"`.

```json
"disown-opener": [ "warning", {
    "includeSameOriginURLs": true
}]
```

## Further Reading

* [The security benefits of `rel="noopener"`](https://mathiasbynens.github.io/rel-noopener/)
* [The performance benefits of `rel="noopener"`](https://jakearchibald.com/2016/performance-benefits-of-rel-noopener/)
* [Bypassing `window.opener` protection of `rel="noreferrer"`](https://html5sec.org/#143)
* [Link type `"noopener"`](https://html.spec.whatwg.org/#link-type-noopener)
* [Link type `"noreferrer"`](https://html.spec.whatwg.org/#link-type-noreferrer)
