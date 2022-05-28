/**
 * Copyright (c) 2019 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: ServiceUpdater.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2019-06-11 12:18:35
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-06-20 12:59:17
 * @Description: This is description.
 */

import fs from 'fs-extra';
import path from 'path';
import { Updater } from './Updater';
import { Log } from '../helpers/Log';

export class ServiceUpdater extends Updater {

    constructor(
        private addFinish: boolean,
        private addFix: boolean,
        private addInit: boolean,
        private addLog: boolean,
        private addShutdown: boolean,
        private addHealth: boolean,
        private priority: number,

        private shouldModify: boolean = false) {

        super();

    }

    public async update() {

        if (!this.shouldModify) {
            Log.info(`Create new Service '${this.options.serviceName}'`);
        } else {
            Log.info(`Modify Service '${this.options.serviceName}'`);
        }

        if (!this.options.serviceName) {
            throw new Error('No Service Name is given. Service could not updated.');
        }

        const buildDir = path.join(this.options.directory, 'build');
        const serviceDir = path.join(buildDir, 'services', this.options.serviceName);

        await /* TODO: JSFIX could not patch the breaking change:
        Creating a directory with fs-extra no longer returns the path 
        Suggested fix: The returned promise no longer includes the path of the new directory */
        fs.ensureDir(serviceDir);

        await this.updateBuildFile(serviceDir);
        await this.updateRunFile(serviceDir);

        if (this.addHealth) {
            await this.updateHealthcheckFile(serviceDir);
        }

        if (this.addFinish) {
            await this.updateFinishFile(serviceDir);
        }

        if (this.addFix) {
            await this.updateAttributeFixFile(serviceDir, this.priority);
        }

        if (this.addInit) {
            await this.updateInitFile(serviceDir, this.priority);
        }

        if (this.addLog) {
            await this.updateLogFile(serviceDir);
        }

        if (this.addShutdown) {
            await this.updateShutdownFile(serviceDir, this.priority);
        }
    }

    private async updateBuildFile(directory: string) {

        const content = `#!/usr/bin/execlineb -P

# Main Build File for your Service

# Comment out if you want use Logging. Don't forget to change also the
# Foldername in your Log Command
# if { s6-mkdir -p /var/log/<yourapp-log-folder>/ }

`;
        await this.saveFile(directory, `${this.options.serviceName}.build`, 'Build', content);
    }

    private async updateRunFile(directory: string) {

        const content = `#!/usr/bin/execlineb -P

# File will called to start your Service

# Load Env Vars
# xb-withenv

`;
        await this.saveFile(directory, `${this.options.serviceName}.run`, 'Run', content);
    }

    private async updateHealthcheckFile(directory: string) {

        const content = `#!/usr/bin/execlineb -P

# Define here the Health Check for your Service

# Load Env Vars
# xb-withenv

`;
        await this.saveFile(directory, `${this.options.serviceName}.health`, 'Health', content);
    }

    private async updateFinishFile(directory: string) {

        const content = `#!/usr/bin/execlineb -S0

# A Service Finish Script

# Load Env Vars
# xb-withenv

`;
        await this.saveFile(directory, `${this.options.serviceName}.finish`, 'Finish', content);
    }

    private async updateAttributeFixFile(directory: string, priority: number) {

        const content = `# Fixing ownership & permissions
# Attention! Remove completely all comments, otherwise your Image will not start.
#
# path                              recurse account             fmode   dmode
# /var/lib/mysql                    true    mysql               0600    0700
# /var/log/<yourapp-log-folder>/    true    nobody,32768:32768  0644    0750

`;
        await this.saveFile(directory, `${this.options.serviceName}.attrs`, 'Fix Attributes', content, priority);
    }

    private async updateInitFile(directory: string, priority: number) {

        const content = `#!/usr/bin/execlineb -P

# Executing container initialization tasks

# Load Env Vars
# xb-withenv

`;
        await this.saveFile(directory, `${this.options.serviceName}.init`, 'Init', content, priority);
    }

    private async updateLogFile(directory: string) {

        const content = `#!/usr/bin/execlineb -P

# exec logutil-service /var/log/<yourapp-log-folder>/

`;
        directory = path.join(directory, 'log');
        fs.ensureDirSync(directory);

        await this.saveFile(directory, `${this.options.serviceName}.run`, 'Log', content);
    }

    private async updateShutdownFile(directory: string, priority: number) {

        const content = `#!/usr/bin/execlineb -S0

# Executing container shutdown tasks

# Load Env Vars
# xb-withenv

`;
        await this.saveFile(directory, `${this.options.serviceName}.shutdown`, 'Shutdown', content, priority);
    }

    private async saveFile(directory: string, filename: string, context: string, content: string, priority?: number) {

        Log.info(`Create Service File for Context '${context}'`);

        if (priority) {
            const prioString = this.convertPriority(priority);
            filename = `${prioString}-${filename}`;
        }

        const file = path.join(directory, filename);
        if (!fs.existsSync(file)) {

            await fs.writeFile(file, content, { encoding: 'utf-8' });
            await fs.chmod(file, 0o755);
        } else {
            Log.warn(`Service File for Context '${context}' could not created. File already exists.`);
        }
    }
    private convertPriority(priority: number): string {

        const prioAsString = priority.toString();

        if (prioAsString.length === 1) {
            return `0${prioAsString}`;
        }
        return prioAsString;
    }
}
