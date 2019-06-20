/**
 * Copyright (c) 2019 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: xinit-service.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2019-06-03 09:30:10
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-06-14 01:03:55
 * @Description: This is description.
 */



import { Command } from 'commander';
import { CommandInfos } from './CommandInfos';
import { Log } from '../helpers/Log';
import { CliManager } from '../helpers/CliManager';
import { CreateServiceCommand } from '../commands/service/CreateServiceCommand';

const program = new Command(`${CommandInfos.main.command} ${CommandInfos.service.command}`)
    .description(CommandInfos.service.description);

program
    .command('create <name>')
    .description('Creates an new Service')
    .option('-i, --image <image>', 'The Name of the Base Image which the Service will created.')
    .option('-p, --priority <prio>', 'The Priority where the service should run. A value between 1-98. 99 is the highest Prio an could not used.', 10)
    .action(async (name, options) => {

        try {
            Log.verbose(`Command '${CommandInfos.main.command} ${CommandInfos.service.command} create' is called ...`);

            await new CreateServiceCommand({
                serviceName: name,
                imageName: options.image,
                addFinish: false,
                addFix: false,
                addInit: false,
                addLog: false,
                addRules: false,
                addShutdown: false,
                priority: 10,
            }).invoke();

        } catch (err) {
            Log.error(err);
        }
    });

program
    .command('modify <name>')
    .description('Modifies a Service')
    .option('--add-fix', 'Add Attribute Fix to modify the Security of folders and files.')
    .option('--add-init', 'Add Init Script which will executed when a container starts.')
    .option('--add-shutdown', 'Add Script which will executed when a Container shutdowns.')
    .option('--add-rules', 'Add Log Rules for the Service.')
    .option('--add-log', 'Add Log Script for the Service.')
    .option('--add-finish', 'Add Service Finish Script which will executed when Service will shutdown.')
    .option('-p, --priority <prio>', 'The Priority when the choosed option should run. A value between 1-98. 99 is the highest Prio an could not used.', 10)
    .action(async (name, options) => {

        try {
            Log.verbose(`Command '${CommandInfos.main.command} ${CommandInfos.service.command} modify' is called ...`);

            await new CreateServiceCommand({
                serviceName: name,
                addFinish: options.addFinish,
                addFix: options.addFix,
                addInit: options.addInit,
                addLog: options.addLog,
                addRules: options.addRules,
                addShutdown: options.addShutdown,
                priority: options.priority,
            }).invoke();

        } catch (err) {
            Log.error(err);
        }
    });

CliManager.parseArguments(program);