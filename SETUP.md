# Open-Stellar Remote Setup

This guide explains how to configure your local repository to push to the Open-Stellar repository.

## Quick Setup

If you're working in a moltworker project and want to push to Open-Stellar, follow these steps:

### Option 1: Using the setup script

1. Navigate to your project directory:
   ```bash
   cd /workspaces/moltworker
   ```

2. Download and review the setup script:
   ```bash
   curl -sSL -o setup-remote.sh https://raw.githubusercontent.com/leocagli/Open-Stellar/main/setup-remote.sh
   cat setup-remote.sh  # Review the script before running
   chmod +x setup-remote.sh
   ./setup-remote.sh
   ```

   **Security Note**: Always review scripts before executing them on your system.

3. Push your main branch:
   ```bash
   git push -u stellar main
   ```

### Option 2: Manual setup

1. Navigate to your project directory:
   ```bash
   cd /workspaces/moltworker
   ```

2. Add the Open-Stellar repository as a remote:
   ```bash
   git remote add stellar https://github.com/leocagli/Open-Stellar.git
   ```

3. Verify the remote was added:
   ```bash
   git remote -v
   ```

4. Push your main branch to the stellar remote:
   ```bash
   git push -u stellar main
   ```

## Troubleshooting

### Remote already exists

If you get an error that the remote already exists, you can update it:
```bash
git remote set-url stellar https://github.com/leocagli/Open-Stellar.git
```

### Authentication issues

Make sure you have the appropriate permissions to push to the Open-Stellar repository. You may need to:
- Configure your GitHub credentials
- Use SSH instead of HTTPS
- Generate a personal access token

### Branch does not exist

If your repository doesn't have a `main` branch, you can push your current branch:
```bash
git push -u stellar $(git branch --show-current)
```

## Additional Information

For more details about the Open-Stellar project, see the [README](README.md).
