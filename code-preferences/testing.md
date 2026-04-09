# Testing Conventions

### Prove dynamism with a fake value, not parametrized real values

When testing that a component passes a value from a hook to a function call, don't parametrize across real enum values with `it.each`. Instead, mock with a distinctive fake value (e.g. `'Test'`) that couldn't match any default. One test proves the value flows through dynamically. If type constraints prevent using a fake value, parametrize across all possible values instead.
