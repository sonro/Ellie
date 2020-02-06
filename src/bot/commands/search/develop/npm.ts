/**
 * npm.ts -- Retrieves information on a specified module hosted on
 * the NPM public registry.
 *
 * Copyright (c) 2019-present Kamran Mackey.
 *
 * Ellie is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Ellie is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Ellie. If not, see <https://www.gnu.org/licenses/>.
 */

import * as request from 'superagent';

import { Message, MessageEmbed } from 'discord.js';

import { Command } from 'discord-akairo';
import moment from 'moment';
import Constants from '../../../utils/Constants';

export default class NPMCommand extends Command {
  public constructor() {
    super('npm', {
      aliases: ['npm'],
      category: 'Search',
      description: {
        content: 'Retrieves information on the specified `npm` package.',
        examples: [
          'react',
          '@types/node',
        ],
        usage: '<package name>',
      },
      args: [
        {
          id: 'query',
          match: 'content',
        },
      ],
    });
  }

  public async exec(message: Message, { query }: { query: string }) {
    const npmQuery = query.toLowerCase();
    const registry = `https://registry.npmjs.com/${npmQuery}`;
    const logo = 'https://raw.githubusercontent.com/npm/logos/master/npm%20square/n-large.png';
    const npmWebsite = 'https://www.npmjs.com';

    if (!npmQuery) {
      return message.channel.send('You did not enter a name of an npm package.');
    }

    if (npmQuery.startsWith('@types')) {
      try {
        const typingsRequest = await request.get(registry);
        const typingsEmbed = new MessageEmbed();
        const typingsName = typingsRequest.body.name;
        const typingsUrl = `https://npmjs.com/package/${query}`;
        const typingsVersion = typingsRequest.body['dist-tags'].latest;
        const typingsDescription = typingsRequest.body.description;

        typingsEmbed.setTitle(typingsName);
        typingsEmbed.setAuthor('npm', logo, npmWebsite);
        typingsEmbed.setURL(typingsUrl);
        typingsEmbed.setColor(0xCC3534);
        typingsEmbed.setThumbnail(logo);
        typingsEmbed.setDescription(
          `${typingsDescription}\n\n`
          + `**Latest Version**: ${typingsVersion}`,
        );
        typingsEmbed.setFooter('Powered by the npm registry API.');
        typingsEmbed.setTimestamp();

        return message.channel.send(typingsEmbed);
      } catch (err) {
        this.client.logger.error(err);
        return message.channel.send('Sorry, unfortunately an error occurred while trying to get results '
          + 'for those typings. Please try again later.');
      }
    }

    try {
      const { body: response } = await request.get(registry);
      const embed = new MessageEmbed();
      const packageName = response.name;
      const packageDescription = response.description || 'No description available.';
      const packageUrl = `https://www.npmjs.com/package/${query}`;
      const latestVersion = response['dist-tags'].latest;
      const versionRc = response['dist-tags'].rc || 'No version available.';
      const versionNext = response['dist-tags'].next || 'No version available.';
      const versions = Object.keys(response.versions).length;
      const license = response.license || 'No license available.';
      const author = response.author ? response.author.name : 'No author found.';
      const created = moment(response.time.created).format(Constants.DATE_FORMAT);
      const lastModified = moment(response.time.modified).format(Constants.DATE_FORMAT);
      const website = `[Click here](${response.homepage})` || 'No website URL available.';
      const bugs = `[Click here](${response.bugs.url})` || 'No bug tracker URL available.';
      const mainFile = response.versions[response['dist-tags'].latest].main || 'Not available.';
      const maintainers = response.maintainers.map((user: any) => user.name).join(', ');

      if (response.time.unpublished) {
        return message.channel.send('Looks like this package is no longer available on the npm registry.'
          + 'Please try a different package.');
      }

      embed.setAuthor('npm', logo, npmWebsite);
      embed.setTitle(packageName);
      embed.setColor(0xCC3534);
      embed.setURL(packageUrl);
      embed.setThumbnail(logo);
      embed.setDescription(
        `${packageDescription}\n\n`
        + `**Latest Version**: ${latestVersion}\n`
        + `**RC Version**: ${versionRc}\n`
        + `**Next Version**: ${versionNext}\n`
        + `**Total Versions**: ${versions}\n`
        + `**License**: ${license}\n`
        + `**Author**: ${author}\n`
        + `**Creation Date**: ${created}\n`
        + `**Last Modified**: ${lastModified}\n`
        + `**Website**: ${website}\n`
        + `**Bug Tracker**: ${bugs}\n`
        + `**Main File**: ${mainFile}\n`
        + `**Maintainers**: ${maintainers}`,
      );
      embed.setFooter('Powered by the npm registry API.');
      embed.setTimestamp();

      return message.channel.send(embed);
    } catch (err) {
      if (err.status === 404) {
        return message.channel.send(
          `I was unable to find \`${query}\` in the npm registry. Please try a different `
          + 'try a differrent package name.',
        );
      }

      this.client.logger.error('Encountered an error while getting npm registry results.');
      this.client.logger.error(err);
      return message.channel.send('I have encountered an error! Please try again later.');
    }
  }
}
