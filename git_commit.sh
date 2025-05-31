#!/bin/bash

# Check if Git identity is configured
config_name=$(git config user.name)
config_email=$(git config user.email)
if [ -z "$config_name" ] || [ -z "$config_email" ]; then
  echo "Git identity not set. Please run:"
  echo 'git config --global user.email "your.email@example.com"'
  echo 'git config --global user.name "Your Name"'
  exit 1
fi

# Reminder: Ensure your SSH key is properly configured for GitHub.
# For instructions, see: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

# Stage all changes
git add .

# Generate a list of updated files and count them
updated_files=$(git diff --cached --name-only)
num_files=$(echo "$updated_files" | wc -l)

# Use a shorter commit message if there are too many files
if [ "$num_files" -gt 50 ]; then
  commit_msg="Updated $num_files files (list skipped due to length)."
else
  commit_msg=$(echo "$updated_files" | awk '{print "- "$0}' ORS='\n')
fi

# Check if there are no changes to commit
if [ -z "$commit_msg" ]; then
  echo "No changes to commit."
  exit 0
fi

# Commit with the generated message
git commit -m "Updated:
$commit_msg"

# Reminder: Password authentication is deprecated.
# Update your remote (use SSH or a personal access token).
git push