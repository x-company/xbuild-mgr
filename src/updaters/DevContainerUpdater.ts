/**
 * Copyright (c) 2019 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: DevContainerUpdater.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2019-06-11 12:18:35
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-06-11 13:43:37
 * @Description: This is description.
 */

import fs from 'fs-extra';
import path from 'path';
import { Updater } from './Updater';
import { Log } from '../helpers/Log';

export class DevContainerUpdater extends Updater {

    public async update() {

        Log.info('Create Dev Container Files');

        const directory = path.join(this.options.directory, '.devcontainer');
        const ciDirectory = path.join(this.options.directory, '.ci');
        await /* TODO: JSFIX could not patch the breaking change:
        Creating a directory with fs-extra no longer returns the path 
        Suggested fix: The returned promise no longer includes the path of the new directory */
        fs.ensureDir(directory);

        await this.updateDevContainerFile(directory);
        // await this.updateDockerfile(this.options.directory);
        await this.updateGitIgnore(this.options.directory);

        await this.updateDockerComposeFile(directory);
        await this.updateDockerComposeFile(ciDirectory, true);

        await this.updateDockerComposeFileForDev(directory);
        await this.updateDockerComposeFileForTests(directory);
    }

    private async updateDevContainerFile(directory: string) {

        Log.info('Create Configuration for Dev Container');
        const file = path.join(directory, 'devcontainer.json');
        if (!fs.existsSync(file)) {

            const content = `// See https://aka.ms/vscode-remote/devcontainer.json for format details.
{
    "name": "${this.options.imageName}",
    "dockerComposeFile": [
        "docker-compose.yml",
        "docker-compose.dev.yml",
    ],
    "service": "run",
    "workspaceFolder": "/workspace",
    "shutdownAction": "stopCompose",

    "extensions": [
        "streetsidesoftware.code-spell-checker",
        "streetsidesoftware.code-spell-checker-german",
        "xiaokangtu.codeheader",
        "philhindle.errorlens",
        "ymotongpoo.licenser",
        "ionutvmi.path-autocomplete",
        "christian-kohler.path-intellisense",
        "alefragnani.bookmarks",
        "pomber.git-file-history",
        "mhutchie.git-graph",
        "emilast.logfilehighlighter",
        "ibm.output-colorizer",
        "johnpapa.vscode-peacock",
        "gruntfuggly.todo-tree",
        "coenraads.bracket-pair-colorizer-2",
        "github.vscode-pull-request-github",
        "emmanuelbeziat.vscode-great-icons",
        "mutantdino.resourcemonitor",

        // Node and Typescript Extensions
        // Comment out if you want develop Node Applications
        /*
        "markis.code-coverage",
        "chrmarti.regex",
        "ms-vscode.vscode-typescript-tslint-plugin",
        "zuoez02.tslint-snippets",
        "kisstkondoros.typelens",
        "pflannery.vscode-versionlens",
        "maty.vscode-mocha-sidebar",
        "adambaldwin.vscode-nsp",
        "eizongmin.node-module-intellisense",
        "christian-kohler.npm-intellisense",
        "gregorbiswanger.json2ts",
        "salbert.comment-ts",
        */

        // Markdown Extensions
        "davidanson.vscode-markdownlint",
        "docsmsft.docs-article-templates",
        "docsmsft.docs-markdown",
        "docsmsft.docs-preview",

        // Bash Extensions
        "rogalmic.bash-debug",
        "bat-snippets.bat-snippets",
        "jetmartin.bats",
        "rpinski.shebang-snippets",
        "foxundermoon.shell-format",
        "remisa.shellman"
    ]
}
`;
            await fs.writeFile(file, content, { encoding: 'utf8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('DevContainer Configuration could not created. File already exists.');
        }
    }

//     private async updateDockerfile(directory: string) {

//         Log.info('Create Dockerfile for Dev Container');
//         const file = path.join(directory, 'Dockerfile.dev');
//         if (!fs.existsSync(file)) {

//             const content = `FROM xcompany/xbuild:latest

// COPY   ./src/${this.options.imageName}/build/ /build/

// COPY   ./src/${this.options.imageName}/rootfs/ /

// COPY    ./.devcontainer/xbuild.conf /build/xbuild.conf

// COPY    ./.devcontainer/sources.list /build/sources.list

// RUN    xb-build

// WORKDIR /

// `;
//             await fs.writeFile(file, content, { encoding: 'utf8' });
//             await fs.chmod(file, 0o644);
//         } else {
//             Log.warn('Dockerfile could not created. File already exists.');
//         }
//     }

    private async updateDockerComposeFile(directory: string, isCI: boolean = false) {

        Log.info('Create Docker Compose File for Dev Container');
        const file = path.join(directory, 'docker-compose.yml');
        if (!fs.existsSync(file)) {

            let content = `version: "3.7"
services:
  build:
`;

            if (!isCI) {
                content += `    image: ${this.options.imageName}:devcontainer
    build:
      context: ..
      dockerfile: Dockerfile.dev
`;
            } else {
                content += `    image: ${this.options.imageName}:test
    build:
      context: ..
      dockerfile: Dockerfile

  test:
    image: ${this.options.imageName}:test
    depends_on:
      - build
    volumes:
      - ../tests/unit/:/tests/
    command: /usr/local/bin/xb-test
`;
            }

            await fs.writeFile(file, content, { encoding: 'utf8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('Docker Compose File could not created. File already exists.');
        }
    }

    private async updateDockerComposeFileForDev(directory: string) {

        Log.info('Create Docker Compose File for Dev Container');
        const file = path.join(directory, 'docker-compose.dev.yml');
        if (!fs.existsSync(file)) {

            const content = `version: "3.7"
services:
  run:
    image: ${this.options.imageName}:devcontainer
    depends_on:
      - build
    volumes:
      # Map the current Source Folder
      - ..:/workspace
      # Configure Git with the current local Settings
      - ~/.gitconfig:/root/.gitconfig
      # Persists Extensions and VSCode Server
      - vscode-server:/root/.vscode-server
    cap_add:
      - SYS_PTRACE
    security_opt:
      - seccomp:unconfined
    command: sleep infinity

volumes:
  vscode-server:
`;
            await fs.writeFile(file, content, { encoding: 'utf8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('Docker Compose File could not created. File already exists.');
        }
    }

    private async updateDockerComposeFileForTests(directory: string) {

        Log.info('Create Docker Compose Test File for Dev Container');
        const file = path.join(directory, 'docker-compose.tests.yml');
        if (!fs.existsSync(file)) {

            const content = `version: "3.7"

services:
  test:
    image: ${this.options.imageName}:devcontainer
    depends_on:
      - build
    volumes:
      - ../tests/unit/:/tests/
    command: /usr/local/bin/xb-test
`;
            await fs.writeFile(file, content, { encoding: 'utf8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('Docker Compose File could not created. File already exists.');
        }
    }

    private async updateGitIgnore(directory: string) {

        Log.info('Create GitIgnore File');
        const file = path.join(directory, '.gitignore');
        if (!fs.existsSync(file)) {

            const content = `# Created by https://www.gitignore.io/api/git,node,linux,macos,windows
# Edit at https://www.gitignore.io/?templates=git,node,linux,macos,windows

### Git ###
# Created by git for backups. To disable backups in Git:
# $ git config --global mergetool.keepBackup false
*.orig

# Created by git when using merge tools for conflicts
*.BACKUP.*
*.BASE.*
*.LOCAL.*
*.REMOTE.*
*_BACKUP_*.txt
*_BASE_*.txt
*_LOCAL_*.txt
*_REMOTE_*.txt

### Linux ###
*~

# temporary files which can be created if a process still has a handle open of a deleted file
.fuse_hidden*

# KDE directory preferences
.directory

# Linux trash folder which might appear on any partition or disk
.Trash-*

# .nfs files are created when an open file is removed but is still being accessed
.nfs*

### macOS ###
# General
.DS_Store
.AppleDouble
.LSOverride

# Icon must end with two \r
Icon

# Thumbnails
._*

# Files that might appear in the root of a volume
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent

# Directories potentially created on remote AFP share
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk

### Node ###
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

### Windows ###
# Windows thumbnail cache files
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db

# Dump file
*.stackdump

# Folder config file
[Dd]esktop.ini

# Recycle Bin used on file shares
$RECYCLE.BIN/

# Windows Installer files
*.cab
*.msi
*.msix
*.msm
*.msp

# Windows shortcuts
*.lnk

# End of https://www.gitignore.io/api/git,node,linux,macos,windows
`;
            await fs.writeFile(file, content, { encoding: 'utf8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('GitIgnore File could not created. File already exists.');
        }
    }
}
