## Corporate Server Access Scripts
A set of shell scripts to connect to the **Staging** and **Production** AWS EC2 servers via EC2 Instance Connect tunnel. With one command, no manual cleanup. In our company, you cannot directly SSH into the servers. You have to open a tunnel through AWS Instance Connect first, then SSH into the tunnel. This setup automates that process and makes it seamless to switch between Staging and Production. Renyah? Leceh? Yes. But this is for the greater good of security and access control.

## Author
Muhamad Sulaiman Misri. Working as a Senior Full Stack Developer in UEM Sunrise berhad. Connect with him on [Github](https://github.com/msulaimanmisri/) or check out his [Website](https://sulaimanmisri.com). You also can email him at [saya@sulaimanmisri.com](mailto:saya@sulaimanmisri.com).

## The Problem (Why This Exists)
Connecting to the servers the old way was painful and error-prone:

**1. known_hosts conflict**.
Both Staging and Production are accessed through the same local tunnel address (`localhost:8286`). SSH saves the host key from the first server you connect to. When you switch to the other server, SSH sees a different key on the same address and throws a security error — forcing you to manually open `~/.ssh/known_hosts` and delete the offending lines every single time.

**2. Too many manual steps**.
Every session required:
- Stop the existing tunnel (if any)
- Remove the old host key from `known_hosts`
- Open a new tunnel with the correct AWS CLI command
- etc. It was a hassle, especially when you had to switch back and forth multiple times a day.

**3. Human error**.
Running a Production command on Staging (or vice versa) because you lost track of which terminal you were in.

**4. Too Lazy to do the cleanup**.
The tunnel process would keep running in the background even after you closed the SSH session. Over time, this led to multiple orphaned tunnels hogging the port and causing connection issues. Serius letih dowh!

## The Solution
Two single-command scripts that:
- Kill any existing tunnel on the port before opening a new one (no port conflicts)
- Bypass `known_hosts` for tunnel connections (safe — trust is already established via AWS IAM)
- Land you directly in the right project folder
- Show the current git branch immediately on login
- Clean up the tunnel automatically when you exit SSH

## Files In This Folder
This setup contains:

- `connect-server.sh` - the main script that loads an env file, opens the tunnel, starts SSH, and kills the tunnel when SSH exits.
- `enter-staging.sh` - shortcut intended for the staging env file.
- `enter-production.sh` - shortcut intended for the production env file.
- `.env.staging` - staging server configuration.
- `.env.production` - production server configuration.

## Requirements
Before using these scripts, make sure your machine already has:

- AWS CLI installed
- Permission to use `aws ec2-instance-connect open-tunnel`
- SSH available
- A valid PEM key file for the target server
- Access to the target EC2 instance and Instance Connect Endpoint
- `lsof` available locally so the script can detect the used tunnel port

## How To Use It
First, copy this `switch-server` folder to your local machine. Suggested location is inside your user directory (`~/switch-server`) for easy access.

**Info**: You can always change the `switch-server` folder name if you want.

Second, Fill everything needed inside the `.env.staging` and `.env.production` files.

Third, run the shortcut scripts to connect to the servers.

### Connect to staging
```bash
~/switch-server/enter-staging.sh
```

### Connect to production
```bash
~/switch-server/enter-production.sh
```

## Env File Structure
Both existing env files currently use this structure:

```bash
# Server Config
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1
AWS_EC2=
AWS_EICE=
TUNNEL_PORT=8286
PEM_FILE=

# Your Application Folder
REMOTE_DIR=

# Your Target Branch
GIT_BRANCH=
```

## What Each Variable Means
- `AWS_ACCESS_KEY_ID` - AWS access key used by the CLI
- `AWS_SECRET_ACCESS_KEY` - AWS secret key used by the CLI
- `AWS_REGION` - AWS region of the instance and endpoint
- `AWS_EC2` - EC2 instance ID
- `AWS_EICE` - EC2 Instance Connect Endpoint ID
- `TUNNEL_PORT` - local port that will be opened for the SSH tunnel
- `PEM_FILE` - private key file used by SSH
- `REMOTE_DIR` - intended application path on the remote server. Not compulsory
- `GIT_BRANCH` - intended branch label for that environment. Not compulsory

## Important Note About `REMOTE_DIR` And `GIT_BRANCH`
Those two fields already exist in the env files, but in the current folder state they are not referenced inside `connect-server.sh` yet. You can use them if you want, but you need to add the logic to the main script yourself.

## Extend It For More Environments
You are not limited to only staging and production. Since `connect-server.sh` accepts any env file path, you can add more environments by creating more env files.

Examples:

- `.env.uat`
- `.env.release`
- `.env.demo`
- `.env.testing`

### Example: add a UAT environment
1. Duplicate one of the current env files:

```bash
cp .env.staging .env.uat
cp enter-staging.sh enter-uat.sh
```

2. Edit `.env.uat` and `enter-uat.sh` and replace the values with the correct UAT server details

3. Connect using the main script:

```bash
~/switch-server/enter-uat.sh
```

### Contribute
If you have any improvements or suggestions, feel free to open an issue or submit a pull request. This setup is meant to be a starting point and can be extended with additional features like:
- Auto-detecting the git branch on the server and showing it in the prompt
- Adding a menu to select which environment to connect to
- Integrating with tools like `tmux` for better session management
- Adding error handling and notifications for failed connections