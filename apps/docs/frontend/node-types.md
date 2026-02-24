# Node Types

All available node types for the workflow builder. Each node belongs to a category and has specific configuration fields.

## Flow Nodes

### Start (`core.start`)
![StartNode](/node_types/start_node.png)

Entry point of every workflow. Automatically created and cannot be deleted.

- **Category:** Flow
- **Outputs:** `next`
- **Config:** None
- **Behavior:** Displays the target website URL from the city configuration. Includes a link to open the site in a new tab for reference while building.

### End (`core.end`)
![EndNode](/node_types/end_node.png)

Marks the completion of a workflow path. Automatically created and cannot be deleted. Every workflow path must terminate at an End node.

- **Category:** Flow
- **Inputs:** `in`
- **Config:** `outcome` — either `available` or `unavailable`
- **Behavior:** Sets the final result of the execution. This outcome determines the check status: `available` maps to `AVAILABLE`, `unavailable` maps to `NOT_AVAILABLE`.

### Wait (`core.wait`)
![WaitNode](/node_types/wait_node.png)

Pauses the workflow execution. Has three modes:

- **Category:** Flow
- **Inputs:** `in` | **Outputs:** `next`

| Mode | Config | Description |
|---|---|---|
| Duration | `seconds` (1-10) | Fixed delay |
| For element | `selector`, `timeoutMs` (optional) | Waits until a CSS selector appears on the page |
| For new tab | `timeoutMs` (optional) | Waits until a new browser tab is opened |

## Browser Nodes

### Click (`core.click`)
![ClickNode](/node_types/click_node.png)

Clicks a DOM element identified by a CSS selector.

- **Category:** Browser
- **Inputs:** `in` | **Outputs:** `next`
- **Config:** `selector` — CSS selector (e.g. `#submit-btn`, `.next-step`)

### Type Text (`core.typeText`)
![TypeNode](/node_types/text_node.png)

Types text into an input field. Supports [template variables](/frontend/builder#template-variables).

- **Category:** Browser
- **Inputs:** `in` | **Outputs:** `next`
- **Config:**
  - `selector` — CSS selector for the target input
  - `text` — Text to type (supports template variables like <code v-pre>{{plate.letters}}</code>, <code v-pre>{{user.firstname}}</code>, etc.)

### Open Page (`core.openPage`)
![OpenPageNode](/node_types/open_page_node.png)

Navigates the browser to a URL. Supports [template variables](/frontend/builder#template-variables).

- **Category:** Browser
- **Inputs:** `in` | **Outputs:** `next`
- **Config:** `url` — Full URL to navigate to


::: tip Note
OpenPage is currently disabled as changes to the functionality of the pipeline disallow users from visiting any pages other than the one of the city a workflow is being created for. The node might be enabled again after careful review.
:::

### Select Option (`core.selectOption`)
![SelectOptionNode](/node_types/select_option_node.png)

Selects an option from a `<select>` dropdown. Has three selection modes:

- **Category:** Browser
- **Inputs:** `in` | **Outputs:** `next`

| Mode | Config | Description |
|---|---|---|
| By text | `selector`, `text` | Matches visible option text (supports variables) |
| By value | `selector`, `value` | Matches the `value` attribute (supports variables) |
| By index | `selector`, `index` | Selects by 0-based index |

## Logic Nodes

### Conditional (`core.conditional`)
![ConditionalNode](/node_types/conditional_node.png)

Branches the workflow based on a condition. Has two output handles: **true** (green) and **false** (red).

- **Category:** Logic
- **Inputs:** `in` | **Outputs:** `true`, `false`

| Operator | Config | Description |
|---|---|---|
| `exists` | `selector` | Checks if a DOM element matching the selector exists |
| `textIncludes` | `selector`, `value` | Checks if the element's text content contains the value (supports variables) |

