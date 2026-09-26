# Form Validation

A sign-up form that checks each field as you go. It shows friendly error messages, a live password strength meter with a rules checklist, a "passwords match" check and a show/hide password button. When everything is valid it shows the data that would have been sent. Nothing ever leaves the page.

## Concepts shown

- the **Constraint Validation API**: HTML rules (`required`, `minlength`, `pattern`, `type="email"`) plus `checkValidity()`, `input.validity` (`valueMissing`, `tooShort`, `typeMismatch`, `patternMismatch`, `customError`) and `setCustomValidity()` for your own rules
- `novalidate` to replace the browser's pop-up bubbles with your own messages
- **regular expressions**: `test()`, character classes, `\d`, `\D`, `\p{L}` with the `u` flag, the `i` flag
- showing errors only after a field is **touched** (`blur`), tracked with a `Set`
- an object of rule functions + `Object.values().every()` for the password
- `aria-invalid` and `aria-describedby` so screen readers get the same feedback
- `FormData` + `Object.fromEntries()`, `delete`, `JSON.stringify(data, null, 2)`, `form.reset()`
- CSS: attribute selectors (`input[aria-invalid="true"]`, `[data-score="3"]`), `:nth-child(-n + 3)`, `::before` checkmarks, `transform: translateY(-50%)`

## Rules

| Field | Rule |
|---|---|
| Full name | required, at least 2 characters, letters/spaces/`-`/`'` only |
| Username | required, 3 to 16 of `A–Z a–z 0–9 _` |
| Email | required, `name@example.com` |
| Phone | optional; if filled, 7 to 15 digits |
| Password | 8+ characters with lowercase, uppercase, number and symbol |
| Confirm | must match the password |
| Terms | must be ticked |

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Form%20Validation/).

## Sample result

```
Full name   J                  → Full name must be at least 2 characters.
Username    lex!               → 3 to 16 characters: letters, numbers and _ only.
Email       lex@mail           → Enter an email like name@example.com.
Password    hello              → Strength: Weak     ✓ lowercase  ○ 8 characters ...
Password    Hello#2026js       → Strength: Strong   ✓ all rules
Confirm     Hello#2026         → Passwords do not match.

After a valid submit:
{
  "fullname": "Lex Tabi",
  "username": "lex_dev",
  "email": "lex@example.com",
  "phone": "",
  "terms": true
}
```
