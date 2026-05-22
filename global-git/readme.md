## About
This `global-git` is a snippet for me to quickly add, enter message and push to the remote branch. My philosophy when it comes to Software Development is to "push often, push early". So, rather than I have to type `git add .`, `git commit -m "message"`, `git push` every time, I can just run this global git command, and just type the commit message. That's it. The rest will be handled by the script.

## How many seconds you save by using this script?
Normally, if you do it manually, it will take you around:
- `git add .` - 2 seconds
- `git commit -m "message"` - 3 seconds or more if you have to think about the commit message
- `git push` - 2 seconds
- Total: 7 seconds or more

With this script, you can do it in just 2 seconds or less for each commit. Unless you decide to think longer about the commit message, then it will take you more time. But, at least, you don't have to type the git commands every time. Penat tau!

## How to use
1. Copy the `global-git` folder to your local machine. Suggested location is inside your user directory (`~/scripts/global-git`) for easy access.
2. Make the `git.sh` file executable by running `chmod +x git.sh`.
3. Add the `global-git` folder to your PATH environment variable. You can do this by adding the following line to your shell configuration file (e.g., `~/.bashrc`, `~/.zshrc`):
   ```bash
   export PATH="$PATH:~/scripts/global-git"
   ```
4. After that, you can run the `git` command from anywhere in your terminal to execute the script.

## Read this if you are using Laravel setup
1. After you done the steps above, open your composer.json file, and add the following line to the `scripts` section:
   ```json
   "git": "global-git"
   ```

2. Or, add this code to the `scripts` section :
   ```json
   "git": "/path/to/your/scripts/global-git/git.sh"
   ```

3. So, each time you want to commit, you can just run `composer git` command, and it will execute the global git script for you.

## Contributing
If you have any improvements or suggestions for this script, please open an issue or submit a pull request. I am open to any ideas that can make this script better and more useful for everyone.