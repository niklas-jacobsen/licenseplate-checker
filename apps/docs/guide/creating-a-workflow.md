# Creating a Workflow

This guide walks through building a workflow that checks license plate availability on a city's reservation website.

## Prerequisites

- A registered account
- Familiarity with CSS selectors (browser DevTools → right-click → "Copy selector")

## Step 1: Create a New Workflow

1. Navigate to **Workflows** from the navigation bar
2. Click **Create Workflow**
3. Enter a name and select the target city
4. Click **Create** — the builder canvas opens

<!-- TODO: Add a screenshot of the create workflow dialog -->

The canvas starts with a **Start** node (showing the city's website URL) connected to an **End** node.

## Step 2: Plan Your Flow

Before adding nodes, open the target city's reservation website in another tab. Identify the steps needed:

1. Which fields need to be filled in? (letters, numbers, city, personal details)
2. Are there dropdowns to select from?
3. Which buttons need to be clicked?
4. Are there any pages that load or redirects that happen?
5. How do you know the plate is available vs. unavailable?

## Step 3: Add Nodes

Drag nodes from the **bottom palette** onto the canvas. Common patterns:

### Filling in a form field

Use a **Type Text** node:
1. Set the `selector` to the input field's CSS selector
2. Set the `text` — use template variables like <code v-pre>{{plate.letters}}</code> so the workflow works for any check

### Clicking a button

Use a **Click** node with the button's CSS selector.

### Selecting from a dropdown

Use a **Select Option** node:
- **By text** if you want to match the visible label (e.g., "Berlin")
- **By value** if you know the `value` attribute
- **By index** for position-based selection

### Waiting for page loads

Use a **Wait** node:
- **Duration** for a fixed delay (e.g., 2 seconds after clicking submit)
- **For element** to wait until a specific element appears (more reliable)
- **For new tab** if the site opens results in a new tab

### Checking the result

Use a **Conditional** node to branch based on what appears on the page:
- **exists** — Check if a success/error message element is present
- **textIncludes** — Check if an element's text contains "available" or "reserved"

Connect the **true** output to an End node with outcome `available`, and the **false** output to an End node with outcome `unavailable`.

## Step 4: Connect Nodes

Drag from an output handle (bottom of a node) to an input handle (top of another node). Each output can only connect to one input.

<!-- TODO: Add a screenshot showing edge creation between two nodes -->

## Step 5: Test the Workflow

1. Click the **Test** button in the bottom palette
2. Enter test values for letters and numbers
3. Click **Run Test**
4. Watch the nodes light up as they execute
5. Review the outcome toast — **Confirm** if correct, **Reject** if not

::: tip
You have a limited number of test executions per day. Use the city's website manually first to understand the flow before testing.
:::

## Step 6: Publish

After a successful test, click **Publish** in the toolbar. The workflow is now available for use with license plate checks.

## Example: Simple Form Fill

A typical workflow for a city that has a simple form:

<!-- TODO: Add a screenshot of a complete example workflow -->

```
Start
  → Type Text (selector: "#letters", text: "{{plate.letters}}")
  → Type Text (selector: "#numbers", text: "{{plate.numbers}}")
  → Click (selector: "#submit-btn")
  → Wait (mode: For element, selector: ".result-message")
  → Conditional (operator: textIncludes, selector: ".result-message", value: "verfügbar")
    → true: End (outcome: available)
    → false: End (outcome: unavailable)
```

## Tips

- **Use `Wait for element`** instead of fixed duration waits — it's more reliable and faster
- **Test with real plate numbers** to see both the available and unavailable paths
- **Check both branches** of a Conditional node to make sure both outcomes are handled
- **Use browser DevTools** to find the right CSS selectors — right-click an element → Inspect → right-click the HTML → Copy → Copy selector
