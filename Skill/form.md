# forms.md

# BOQ AI Form Development Guide

## Purpose

This document explains how forms should be implemented in BOQ AI.

It covers:

* Controlled Components
* Form Validation
* Local Storage
* State Management
* User Experience Rules
* Error Handling

The goal is to ensure all forms are:

* Easy to use
* Consistent
* Accessible
* Reliable
* Easy to maintain

---

# What Is A Form?

A form is a collection of fields that allows users to enter information.

Examples in BOQ AI:

* Login Form
* Registration Form
* Project Upload Form
* Region Selection Form
* Rate Library Form

Example:

```jsx
<form>
  <input type="text" />
  <button>Submit</button>
</form>
```

The form collects information and sends it to the application.

---

# Controlled Components

## Definition

A controlled component is an input field whose value is controlled by React state.

Example:

```jsx
const [email, setEmail] = useState("");

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

## How It Works

### Step 1

User types:

```text
samuel@gmail.com
```

---

### Step 2

onChange fires.

```jsx
onChange={(e) => setEmail(e.target.value)}
```

---

### Step 3

React updates state.

```jsx
setEmail("samuel@gmail.com")
```

---

### Step 4

State updates UI.

```jsx
value={email}
```

---

## Why Controlled Components?

Benefits:

| Benefit           | Explanation                    |
| ----------------- | ------------------------------ |
| Validation        | Easy to validate user input    |
| Real-Time Updates | State changes instantly        |
| Error Handling    | Easier to show errors          |
| Consistency       | React controls all values      |
| Predictability    | Form behavior becomes reliable |

---

## Example

```jsx
const [projectName, setProjectName] = useState("");

<input
  value={projectName}
  onChange={(e) => setProjectName(e.target.value)}
/>
```

---

## Line By Line Explanation

```jsx
const [projectName, setProjectName] = useState("");
```

| Code           | Purpose       |
| -------------- | ------------- |
| projectName    | Current value |
| setProjectName | Updates value |
| useState("")   | Creates state |

---

```jsx
value={projectName}
```

Uses state as the source of truth.

---

```jsx
onChange={(e) => setProjectName(e.target.value)}
```

Updates state whenever user types.

---

# Validation

## Definition

Validation checks whether the user's input is correct.

Example:

Email cannot be empty.

---

## Example

```jsx
if (!email) {
  setError("Email is required");
}
```

---

## Types Of Validation

### Required Validation

```jsx
if (!projectName)
```

Checks if user entered a value.

---

### Email Validation

```jsx
email.includes("@")
```

Checks email format.

---

### Number Validation

```jsx
projectArea > 0
```

Ensures positive values.

---

### File Validation

```jsx
file.type === "application/pdf"
```

Ensures uploaded file is PDF.

---

## Why Validation Matters

Without validation:

* Wrong data enters system
* Cost estimates fail
* BOQ generation fails

---

# Local Storage

## Definition

Local Storage stores data inside the browser.

Data remains even after page refresh.

---

## Example

```jsx
localStorage.setItem(
  "region",
  selectedRegion
);
```

Stores:

```text
Lagos
```

---

## Retrieving Data

```jsx
const region =
  localStorage.getItem("region");
```

Returns:

```text
Lagos
```

---

## Use Cases In BOQ AI

### Save Region

User chooses:

```text
Ibadan
```

Store it.

Next visit:

Automatically load:

```text
Ibadan
```

---

### Save Draft Project

Store:

* Project Name
* Building Type
* Region

before submission.

---

### Save User Preferences

Store:

* Theme
* Currency
* Region

---

## Benefits

| Benefit           | Explanation              |
| ----------------- | ------------------------ |
| Faster Experience | Less repeated input      |
| Better UX         | User settings remembered |
| Draft Recovery    | Unsaved work protected   |

---

# Error Handling

## Example

```jsx
try {
  await uploadFile();
} catch(error) {
  setError(
    "Upload failed"
  );
}
```

---

## Why?

Users must understand what went wrong.

Bad:

```text
Error
```

Good:

```text
PDF upload failed.
Please try again.
```

---

# Loading States

Users should know when processing is happening.

Example:

```jsx
const [loading, setLoading] =
useState(false);
```

---

Before request:

```jsx
setLoading(true);
```

---

After request:

```jsx
setLoading(false);
```

---

UI:

```jsx
<button disabled={loading}>
  Generate BOQ
</button>
```

---

## Why Important?

BOQ generation may take:

* 5 seconds
* 15 seconds
* 30 seconds

Users need feedback.

---

# Project Upload Form Example

```jsx
<form>

<input
type="text"
placeholder="Project Name"
/>

<select>
<option>Lagos</option>
<option>Ibadan</option>
<option>Abuja</option>
</select>

<input
type="file"
accept=".pdf"
/>

<button>
Generate BOQ
</button>

</form>
```

---

# Explanation

| Element      | Purpose           |
| ------------ | ----------------- |
| Project Name | Identify project  |
| Region       | Pricing location  |
| File Upload  | Architectural PDF |
| Generate BOQ | Start analysis    |

---

# Form Rules For BOQ AI

Every form must:

✓ Use Controlled Components

✓ Validate Inputs

✓ Display Errors

✓ Show Loading States

✓ Save Important Preferences

✓ Support Mobile Devices

✓ Prevent Duplicate Submissions

✓ Use Clear Labels

✓ Be Accessible

---

# Forms That Require Validation

## Registration Form

Validate:

* Name
* Email
* Password

---

## Login Form

Validate:

* Email
* Password

---

## Project Upload Form

Validate:

* Project Name
* Region
* PDF File

---

## Rate Library Form

Validate:

* Material Name
* Unit
* Region
* Price

---

# Common Mistakes To Avoid

Do NOT:

❌ Use uncontrolled inputs

❌ Submit empty forms

❌ Ignore validation

❌ Ignore loading states

❌ Store sensitive information in database

❌ Allow invalid PDFs

❌ Hide error messages

---

# Success Criteria

A user should be able to:

1. Open a form.
2. Understand what is required.
3. Enter information.
4. Receive immediate validation feedback.
5. Submit successfully.
6. Recover saved preferences automatically.

without any training or technical knowledge.
