FROM node:20-bullseye

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    ca-certificates \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g typescript ts-node nodemon

# Install Beads task tracker for AI agents
RUN npm install -g @beads/bd

# Install Playwright system dependencies
RUN npx -y playwright@1.58.0 install-deps chromium

# Set the default user to node
USER node
