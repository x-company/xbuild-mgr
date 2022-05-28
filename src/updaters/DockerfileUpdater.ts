/**
 * Copyright (c) 2019 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
/*
 * @Script: DockerfileUpdater.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2019-06-11 12:23:43
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-06-11 13:01:18
 * @Description: This is description.
 */

import fs from 'fs-extra';
import path from 'path';
import { Updater } from './Updater';
import { Log } from '../helpers/Log';

export class DockerfileUpdater extends Updater {

    constructor(private withProjectLayout: boolean) {
        super();
    }

    public async update() {

        Log.info('Create Dockerfile for your Image');

        let directory = '';
        if (!this.withProjectLayout) {
            directory = path.join(this.options.directory, 'xbuild');
        } else {
            directory = path.join(this.options.directory, 'src', this.options.imageName);
        }

        await /* TODO: JSFIX could not patch the breaking change:
        Creating a directory with fs-extra no longer returns the path 
        Suggested fix: The returned promise no longer includes the path of the new directory */
        fs.ensureDir(directory);

        await this.updateDockerfile(directory);
        if (this.withProjectLayout) {
            await this.updateDockerIgnore(this.options.directory);
        }
    }

    private async updateDockerfile(directory: string) {

        let file = path.join(directory, 'Dockerfile.tmpl');
        if (!this.withProjectLayout) {
            file = path.join(directory, 'Dockerfile');
        }

        if (!fs.existsSync(file)) {
            let content = `# This is a Docker Build File
#
`;
            if (!this.withProjectLayout) {
                content += '# POWERTIP: Use Snippet xb-docker-no-layout to create your Dockerfile';
            } else {
                content += '# POWERTIP: Use Snippet xb-docker to create your Dockerfile';
            }

            await fs.writeFile(file, content, { encoding: 'utf-8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('Dockerfile could not created. File already exists.');
        }
    }

    private async updateDockerIgnore(directory: string) {

        Log.info('Create Dockerignore File for your Image');
        const file = path.join(directory, '.dockerignore');
        if (!fs.existsSync(file)) {

            const content = `# Global Ignores
Dockerfile
.dockerignore

# Define your own Ignores which should not be included to your Image
`;

            await fs.writeFile(file, content, { encoding: 'utf-8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('Dockerignore could not created. File already exists.');
        }
    }
}
