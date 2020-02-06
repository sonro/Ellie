/**
 * user.ts -- The user command. Allows a user to get information on a
 * specified user.
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

import { Message, MessageEmbed, GuildMember } from 'discord.js';

import { Command } from 'discord-akairo';
import moment from 'moment';
import Constants from '../../utils/Constants';

export default class UserCommand extends Command {
  public constructor() {
    super('user', {
      aliases: ['user'],
      category: 'Information',
      description: {
        content: 'Retrieves detailed information on a user, if available.',
        usage: '<blank> or <user>',
      },
      args: [
        {
          id: 'member',
          match: 'content',
          type: 'member',
          default: (message: Message) => message.member,
        },
      ],
    });
  }

  public async exec(message: Message, { member }: { member: GuildMember }) {
    if (message.channel.type === 'dm') {
      return message.channel.send('This command cannot be used in direct messages!');
    }

    const embed = new MessageEmbed();
    const created = moment.utc(member.user.createdAt).format(Constants.DATE_FORMAT);
    const { id } = member;
    const { tag } = member.user;
    const type = member.user.bot ? 'Bot' : 'User';

    // eslint-disable-next-line array-callback-return
    const activities = member.user.presence.activities.filter((a) => a.type === 'CUSTOM_STATUS').map((a) => {
      if (a.type === 'LISTENING') {
        if (a.name === 'Spotify') {
          // const { assets } = a;
          // const song = a.details;
          const artists = a.state;
          // const album = a.assets?.largeText;
          // const uri = a.syncID;

          if (artists?.includes(';')) {
            const replacer = artists.replace(';', ',');
            const commas = replacer.match(',')?.length as number;

            if (commas >= 2) {
              artists.replace(/,([^,]*)$/, ', &');
            } else {
              artists.replace(/,([^,]*)$/, '&');
            }

            this.client.logger.info(artists);
          }
        }
      }
    });

    const joined = moment.utc(member.joinedAt!).format(Constants.DATE_FORMAT);
    const color = member.displayHexColor;
    const nickname = member.nickname || 'No nickname.';
    const role = member.roles.hoist ? member.roles.hoist.name : 'No main role.';
    const roles = member.roles.filter((r) => r.name !== '@everyone').map((r) => r.name).join(' | ') || 'No roles.';
    const roleCount = member.roles.filter((r) => r.name !== '@everyone').size;

    let status: string;
    if (member.user.presence.status === 'online') {
      status = 'Online';
    } else if (member.user.presence.status === 'idle') {
      status = 'Idle';
    } else if (member.user.presence.status === 'dnd') {
      status = 'Do Not Disturb';
    } else if (member.user.bot) {
      status = 'Unavailable';
    } else {
      status = 'Offline';
    }

    embed.setTitle(`Information on user ${member.user.username}`);
    embed.setThumbnail(member.user.displayAvatarURL());
    embed.setColor(color);
    embed.setDescription(
      '**__General__**:\n'
      + `**Status**: ${status}${activities}\n`
      + `**Type**: ${type}\n`
      + `**Tag**: ${tag}\n`
      + `**ID**: ${id}\n`
      + `**Creation Date**: ${created}\n\n`
      + '**__Guild-specific Info__**:\n'
      + `**Joined**: ${joined}\n`
      + `**Nickname**: ${nickname}\n`
      + `**Display Color**: ${color}\n`
      + `**Main Role**: ${role}\n`
      + `**Roles (${roleCount})**: ${roles}\n`,
    );

    return message.channel.send(embed);
  }
}
