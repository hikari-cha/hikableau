# Common Implementation Guidelines

- **Context Awareness**: Identify the implementation ID (e.g., `hikari-1`) from the current git branch name. Use the documentation found in `ai-docs/{ID}` as a reference for your implementation.
- **Documentation**:
  - Each implementation directory contains `implementation.md` and `test.md`.
  - **Implementation Log**: Record the details of your actual implementation in `implementation.md`.
  - **Test Log**: Record the details of tests performed, including unit tests, in `test.md`.
  - **Maintenance**: When making further changes, always verify if `implementation.md` or `test.md` requires updates and modify them accordingly to keep documentation synchronized with code.
- **UI Design**: Adhere strictly to the guidelines specified in `ai-docs/design.md`.
