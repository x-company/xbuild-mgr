/**
 * Copyright (c) 2019 IT Solutions Roland Breitschaft <info@x-company.de>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * @Script: UnitTestsUpdater.ts
 * @Author: Roland Breitschaft
 * @Email: roland.breitschaft@x-company.de
 * @Create At: 2019-06-11 12:18:35
 * @Last Modified By: Roland Breitschaft
 * @Last Modified At: 2019-06-11 14:16:08
 * @Description: This is description.
 */

import fs from 'fs-extra';
import path from 'path';
import { Updater } from './Updater';
import { Log } from '../helpers/Log';

export class UnitTestsUpdater extends Updater {

    public async update() {

        Log.info('Create Unit Tests');

        const directory = path.join(this.options.directory, 'tests', 'unit', this.options.imageName);
        await /* TODO: JSFIX could not patch the breaking change:
        Creating a directory with fs-extra no longer returns the path 
        Suggested fix: The returned promise no longer includes the path of the new directory */
        fs.ensureDir(directory);
        await this.updateBatsFile(directory);
    }

    private async updateBatsFile(directory: string) {

        Log.info('Create UnitTest Sample');

        const file = path.join(directory, 'sample.bats');
        if (!fs.existsSync(file)) {
            const content = `#!/usr/bin/env bats
# -*- coding: utf-8 -*-

load init

@test "addition using bc" {
    # Arrange

    # Act
    result="$(echo 2+2 | bc)"

    # Assert
    [ "$result" -eq 4 ]
}

@test "addition using dc" {
    # Arrange

    # Act
    result="$(echo 2 2+p | dc)"

    # Assert
    [ "$result" -eq 4 ]
}
`;
            await fs.writeFile(file, content, { encoding: 'utf-8' });
            await fs.chmod(file, 0o644);
        } else {
            Log.warn('UnitTest Sample could not created. File already exists.');
        }
    }
}
