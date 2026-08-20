# Security

This plugin runs with the same authority as the DeepSeek Harness Host process. It can read and overwrite existing files under the current project's `openspec/` directory.

It does not create, delete, or rename files, and it rejects path traversal outside that directory.

Report vulnerabilities through GitHub Issues at https://github.com/wx971025/dsh-openspec/issues.
