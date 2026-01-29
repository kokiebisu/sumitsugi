FROM node:20-bullseye

# Install additional OS packages including GitHub CLI and Docker
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    ca-certificates \
    apt-transport-https \
    gnupg \
    lsb-release \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get -y install --no-install-recommends gh docker-ce-cli docker-compose-plugin \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g typescript ts-node nodemon

# Install Beads task tracker for AI agents
RUN npm install -g @beads/bd

# Install Playwright system dependencies
RUN npx -y playwright@1.58.0 install-deps chromium

# Add node user to docker group for Docker socket access
RUN groupadd -f docker && usermod -aG docker node

# Set the default user to node
USER node

# Install Claude Code CLI as node user
RUN curl -fsSL https://claude.ai/install.sh | bash
