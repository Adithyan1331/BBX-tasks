# Fieldnotes task manager

A no-framework task manager built with HTML, CSS, and vanilla JavaScript. It uses the free [JSONPlaceholder Todos API](https://jsonplaceholder.typicode.com/todos). Its write endpoints return simulated success responses; changes are not persisted by that service.

## Project structure

- `index.html` is the page entry point and connects the stylesheet, script, and favicon.
- `styles.css` contains the responsive layout and component styles.
- `app.js` implements API requests, rendering, task interactions, and the browser exercises.
- `favicon.svg` is the Fieldnotes app icon.
- `README.md` explains how to run and verify the exercises.

There is no `package.json`: the app has no build step or npm dependencies.

## Run it

Open `index.html` in a browser, or serve this folder from a local HTTP server, for example:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`. The app needs an internet connection to contact JSONPlaceholder. For a real CORS origin and reliable local debugging, use the HTTP server rather than opening the page as a `file:` URL.

## What to try

- On load, the app fetches tasks and shows loading, error, and empty states as applicable. Add, edit, delete, and toggle tasks; each action updates the interface immediately and rolls back with a visible message if its request fails.
- Search is debounced for 300 ms. Each new input cancels the previous timer and aborts an in-flight request. A request sequence guard also ignores a response that has become stale. To observe why the guard matters, temporarily remove the abort and sequence check, throttle the network in DevTools, type two different searches in quick succession, and observe an older response overwriting the newer results. Restore both protections before using the app.
- The task list has exactly one click listener, attached to the list container. After the initial load, add a task and use its edit/delete buttons or completion checkbox; those newly rendered controls still work through delegation.
- To test rollback, use DevTools request blocking or switch offline after the list loads, then try a mutation. The immediate UI change is restored after the failed request. Re-enable the request/network afterwards.
- Use **See CORS in action** to make a cross-origin fetch to `https://example.com/`, then open that same URL with the adjacent link. Chromium logged this exact message from `http://localhost:8765`: `Access to fetch at 'https://example.com/' from origin 'http://localhost:8765' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` The same URL loaded as a page when opened directly. Browser console wording varies by browser, page origin, and network conditions; the fetch result also appears in the page.
- Run the 5,000-item benchmark to compare appending each item to a connected container with building a `DocumentFragment` and appending it once. In three browser runs, loop/fragment timings were 82.00/121.30 ms, 45.70/40.40 ms, and 46.70/68.50 ms. The averages were 58.13/76.73 ms, so the loop was 18.60 ms faster on average in this environment. Timings vary by hardware, browser, and run.
- To check safe rendering, add the literal title `<img src=x onerror="alert('XSS')">`. It appears as text and does not execute. This project intentionally does not include an unsafe `innerHTML` phase or trigger an alert.

## Security note: safe task rendering (100 words)

Task titles are user-controlled, so the renderer creates elements with `document.createElement` and assigns titles with `textContent`. This treats markup-looking input as characters rather than asking the HTML parser to interpret it. The title `<img src=x onerror="alert('XSS')">` therefore appears literally; it cannot create an image or execute its event handler. Buttons and labels are also built with DOM APIs, not HTML strings containing user values. This project demonstrates the fixed behavior only: it never adds an unsafe rendering mode or runs an alert. Validate input for product rules, but do not rely on validation for output safety.

## Security note: CORS (100 words)

CORS is a browser-enforced rule governing whether page JavaScript may read a cross-origin response. The destination server opts in by returning an `Access-Control-Allow-Origin` header; the browser compares that permission with the requesting page's origin. A failed fetch does not prove the server is unreachable, nor does it mean the front end caused a failure. Opening the URL navigates the browser to the destination; this is a different operation and does not give the original page JavaScript access to that response. The browser enforces CORS to protect users and origins, while server owners configure response headers. This is enforced by design.

## Written answer: What is event delegation and why use it? (150 words)

Event delegation means registering a single handler on a stable ancestor instead of attaching a handler to every child control. When someone clicks a button, the browser dispatches the event through the DOM, so the ancestor receives it through bubbling. The handler inspects the event target, finds the relevant child with `closest`, and performs the matching action. The task list has one click listener for edit, delete, and completion actions. It continues working for rows created after the initial fetch because those rows are inserted beneath the list container; no new listeners need to be attached. This reduces listener bookkeeping, keeps rendering code simpler, and avoids missing handlers after rerendering. Delegation is useful when children are numerous or frequently replaced. It should be scoped to the intended container and should verify that the matched element belongs to that container, so clicks elsewhere or on unrelated nested content cannot trigger actions.

## Written answer: Explain CORS to a back-end developer who thinks it is a front-end bug. (150 words)

CORS is a browser security protocol, not a feature implemented by a framework. A page has a unique origin: scheme, host, and port. When JavaScript requests a resource from another origin, the browser checks the response’s CORS headers before exposing that response to the page. The destination server grants access by returning an `Access-Control-Allow-Origin` value that permits the page’s origin; some requests also trigger an `OPTIONS` preflight, which the server must answer. The network request can reach the server and be unreadable to JavaScript when the permission headers are absent or incorrect. A developer may see the failure in the front end because that is where the browser reports it, but the policy decision uses the server’s response. Opening the URL directly is navigation, not script access from the page, so it may work. Configure the API’s allowed origins and methods; do not disable browser protection.
