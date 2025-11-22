---
title: Animating the dialog and popover elements
description: Animating the dialog and popover elements
date_created: '2025-05-18'
date_updated: '2025-11-03'
date_published: null
pinned: false
tags:
  - design
  - css
  - html
---

# Animating the dialog and popover elements

[[Animating the dialog element]]
[Very simple codepen.io to show animating the dialog](https://codepen.io/argyleink/pen/zYbQBOm)
[Good video about animating the top layer](https://www.youtube.com/watch?v=0ku46p3oo-Y&list=PLNYkxOF6rcIAx_S2LSfXQLorIeehsPL3q&index=13) - Good links here, too
[What is the top layer](https://developer.chrome.com/blog/what-is-the-top-layer)

[Adam Argyl on the dialog element](https://web.dev/articles/building/a-dialog-component#adding-light-dismiss)

# How to fade a dialog element when it closes

Of course! Fading a `<dialog>` element when it closes is a common and excellent way to improve user experience.

The main challenge is that when you call the `dialog.close()` method, the browser immediately sets `display: none` on the element, which prevents any CSS transitions or animations from running.

Here are the two best methods to solve this, from the most compatible to the most modern.


### Method 1: The "Graceful Close" with JavaScript (Most Compatible)

[See this codepen](https://codepen.io/rogerpence/pen/MYaYdjX)

This is the most common and reliable method. Instead of closing the dialog immediately, we'll:
1.  Add a "closing" CSS class to trigger the fade-out animation.
2.  Listen for the `animationend` (or `transitionend`) event.
3.  Once the animation is finished, *then* we call `dialog.close()`.

Here’s a complete, working example.

#### HTML
```html
<button id="open-btn">Open Dialog</button>

<dialog id="my-dialog">
  <h2>My Dialog</h2>
  <p>Click the button or press Escape to close me with a fade effect.</p>
  <button id="close-btn">Close</button>
</dialog>
```

#### CSS
We'll use CSS keyframes for a smooth fade-out and a subtle shrink effect.

```css
dialog {
  padding: 2em;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Style for when the dialog is opening */
dialog[open] {
  animation: fadeIn 0.3s ease-in-out;
}

/* Style for when we manually trigger the close */
dialog.closing {
  animation: fadeOut 0.3s ease-in-out forwards; /* 'forwards' keeps the final state */
}

/* Backdrop styling */
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease-in-out;
}

dialog.closing::backdrop {
  animation: fadeOut 0.3s ease-in-out forwards;
}

/* Keyframe animations */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.95); }
}
```

#### JavaScript
This is where we orchestrate the closing logic.

```javascript
const dialog = document.getElementById('my-dialog');
const openBtn = document.getElementById('open-btn');
const closeBtn = document.getElementById('close-btn');

// Open the dialog
openBtn.addEventListener('click', () => {
  dialog.showModal();
});

// Function to handle the closing logic
function closeDialog() {
  dialog.classList.add('closing');

  // Listen for the animation to end
  dialog.addEventListener('animationend', () => {
    dialog.classList.remove('closing');
    dialog.close();
  }, { once: true }); // { once: true } removes the listener after it runs
}

// Close the dialog with the custom function
closeBtn.addEventListener('click', () => {
  closeDialog();
});

// Also handle the 'cancel' event (when user presses Escape)
dialog.addEventListener('cancel', (event) => {
  // Prevent the default browser behavior (immediate closing)
  event.preventDefault(); 
  closeDialog();
});
```

**Pros:**
*   **Highly Compatible:** Works in all modern browsers that support `<dialog>`.
*   **Full Control:** You have explicit control over the entire process.

**Cons:**
*   Requires more JavaScript boilerplate.


### Method 2: The Modern CSS-Only Approach (Simpler but Newer)

Modern browsers are starting to make this much easier by allowing you to animate discrete properties like `display`. With the `@starting-style` rule, you can create a purely CSS-driven fade-in and fade-out.

This approach transitions the `opacity` and lets the browser handle the `display` property change at the end of the transition.

> **Note:** Browser support for animating `display` and using `@starting-style` is still evolving. Check sites like [Can I use...](https://caniuse.com/css-transitions-on-discrete-properties) for the latest compatibility. This works well in Chrome/Edge 117+ and Firefox 124+.

#### HTML
The HTML is the same.
```html
<button id="open-btn-css">Open CSS-Powered Dialog</button>

<dialog id="my-dialog-css">
  <h2>Modern CSS Dialog</h2>
  <p>This dialog fades in and out using modern CSS features.</p>
  <button id="close-btn-css">Close</button>
</dialog>
```

#### CSS
The CSS is much simpler. We define the starting and ending states and let the browser handle the transition.

```css
#my-dialog-css {
  /* Start with opacity 0 and not displayed */
  opacity: 0;
  transform: scale(0.9);
  transition:
    opacity 0.3s,
    transform 0.3s,
    /* Allow the browser to transition 'display' after other transitions finish */
    display 0.3s allow-discrete;
}

/* When the dialog has the [open] attribute, it's visible */
#my-dialog-css[open] {
  opacity: 1;
  transform: scale(1);
}

/* This is the magic for the OPENING animation */
/* It defines the style *before* the element is shown */
@starting-style {
  #my-dialog-css[open] {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* Fade the backdrop as well */
#my-dialog-css::backdrop {
  background-color: rgba(0, 0, 0, 0);
  transition:
    background-color 0.3s,
    display 0.3s allow-discrete;
}

#my-dialog-css[open]::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

@starting-style {
  #my-dialog-css[open]::backdrop {
    background-color: rgba(0, 0, 0, 0);
  }
}
```

#### JavaScript
The JavaScript becomes incredibly simple because we no longer need to manage the closing state.

```javascript
const dialogCss = document.getElementById('my-dialog-css');
const openBtnCss = document.getElementById('open-btn-css');
const closeBtnCss = document.getElementById('close-btn-css');

openBtnCss.addEventListener('click', () => {
  dialogCss.showModal(); // The CSS handles the animation automatically
});

closeBtnCss.addEventListener('click', () => {
  dialogCss.close(); // The CSS handles the fade-out before display: none
});
```
When you call `dialog.close()`, the `[open]` attribute is removed. The browser sees this and transitions the element from its `[open]` styles back to its default styles (`opacity: 0`) before finally applying `display: none`.

**Pros:**
*   **Very Clean:** Minimal JavaScript, declarative CSS.
*   The "future-proof" way of doing things.

**Cons:**
*   **Limited Browser Support:** Relies on very new CSS features.


### Recommendation

For production websites today, **Method 1 (JavaScript "Graceful Close") is the safest and most reliable choice**. It guarantees a consistent experience for all your users.

As browser support improves, **Method 2 (Modern CSS-Only) will become the standard** due to its simplicity and elegance. You could use it today if you're developing for a platform with a known, modern browser environment (like an Electron app).