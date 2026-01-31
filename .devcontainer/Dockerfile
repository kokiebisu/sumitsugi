FROM node:20-bullseye

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest

# Install development tools, Docker CLI, and network utilities
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y --no-install-recommends \
  less \
  git \
  curl \
  wget \
  procps \
  sudo \
  fzf \
  zsh \
  man-db \
  unzip \
  ca-certificates \
  apt-transport-https \
  gnupg \
  lsb-release \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  jq \
  nano \
  vim \
  # Add GitHub CLI repository
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  # Add Docker repository
  && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
  && apt-get update \
  && apt-get install -y --no-install-recommends gh docker-ce-cli docker-compose-plugin \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python and pip (needed for uv/serena)
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  python3-pip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g nodemon typescript typescript-language-server

# Install Playwright system dependencies
RUN npx -y playwright@1.58.0 install-deps chromium

# Add node user to docker group for Docker socket access
RUN groupadd -f docker && usermod -aG docker node

# Ensure default node user has access to /usr/local/share
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R node:node /usr/local/share

ARG USERNAME=node

# Persist bash history
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Create workspace and config directories and set permissions
RUN mkdir -p /workspace /home/node/.claude && \
  chown -R node:node /workspace /home/node/.claude

WORKDIR /workspace

# Install git-delta for better diffs
ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Set up non-root user
USER node

# Install global packages
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

# Set the default editor and visual
ENV EDITOR=nano
ENV VISUAL=nano

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

# Install uv (Python package manager for serena)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add ~/.local/bin to PATH for Claude CLI
ENV PATH=/home/node/.local/bin:$PATH
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/node/.bashrc && \
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/node/.zshrc

# Copy and set up firewall script
COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall && \
  chmod 0440 /etc/sudoers.d/node-firewall
USER node

# Install Beads CLI (bd) for AI-friendly task tracking
ARG BEADS_VERSION=0.49.1
RUN ARCH=$(uname -m) && \
  case "$ARCH" in \
    x86_64) BEADS_ARCH="linux_amd64" ;; \
    aarch64) BEADS_ARCH="linux_arm64" ;; \
    *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
  esac && \
  curl -fsSL "https://github.com/steveyegge/beads/releases/download/v${BEADS_VERSION}/beads_${BEADS_VERSION}_${BEADS_ARCH}.tar.gz" | tar -xz -C /home/node/.local/bin bd && \
  chmod +x /home/node/.local/bin/bd && \
  # Install shell completions (bash and zsh only)
  mkdir -p /home/node/.local/share/bash-completion/completions && \
  /home/node/.local/bin/bd completion bash > /home/node/.local/share/bash-completion/completions/bd && \
  mkdir -p /home/node/.zsh/completions && \
  /home/node/.local/bin/bd completion zsh > /home/node/.zsh/completions/_bd && \
  echo 'fpath=(~/.zsh/completions $fpath)' >> /home/node/.zshrc
