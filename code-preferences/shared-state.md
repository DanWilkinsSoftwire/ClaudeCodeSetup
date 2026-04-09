# Shared State & Cross-File Dependencies

### Extract shared string keys into named constants

Source: PR #3424

When a string value is shared across files (e.g. loading keys, event names, storage keys), extract it into a named constant. Do not rely on two files using the same magic string independently.

### Mark workarounds with warning comments

Source: PR #3424

When a workaround or non-ideal pattern is necessary (e.g. cross-file side effects, inverted call order), add a comment that: (a) explains *why* it was done this way, (b) explicitly states it should not be copied. Place the comment at the usage site, not in a distant file.
