/**
 * guild.ts -- Retrieves information about the current Discord
 * guild (server).
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

import { Message, MessageEmbed } from 'discord.js';

import { Command } from 'discord-akairo';
import moment from 'moment';
import Constants from '../../utils/Constants';

export default class GuildCommand extends Command {
  public constructor() {
    super('server', {
      aliases: ['server', 'guild', 'serverinfo', 'guildinfo'],
      category: 'Information',
      description: {
        content: 'Retrieves detailed information about the current Discord guild.',
        usage: '',
      },
      args: [
        {
          id: 'guild',
          type: 'guild',
        },
      ],
    });
  }

  public async exec(message: Message) {
    if (message.guild!.available) {
      const embed = new MessageEmbed();
      const { name } = message.guild!;
      const { id } = message.guild!;
      const owner = message.guild!.owner!.user.tag;
      const members = message.guild!.members.size;
      const icon = message.guild!.iconURL() as string;
      const users = message.guild!.members.filter((m) => !m.user.bot).size;
      const bots = message.guild!.members.filter((m) => m.user.bot).size;
      const totalPresencces = message.guild!.presences.size;
      const userPresences = message.guild!.presences.filter((p) => !p.user!.bot).size;
      const botPresences = message.guild!.presences.filter((p) => p.user!.bot).size;
      const channels = message.guild!.channels.filter((c) => c.type !== 'category').size;
      const textChannels = message.guild!.channels.filter((c) => c.type === 'text').size;
      const voiceChannels = message.guild!.channels.filter((c) => c.type === 'voice').size;
      const roles = message.guild!.roles.filter((r) => r.name !== '@everyone').map((r) => r.name).join(', ');
      const roleCount = message.guild!.roles.filter((r) => r.name !== '@everyone').size;
      const highestRole = message.guild!.roles.highest;
      const emojis = message.guild!.emojis.size || 'No emojis.';
      const normalEmojis = message.guild!.emojis.filter((e) => !e.animated).size;
      const animatedEmojis = message.guild!.emojis.filter((e) => e.animated).size;
      const created = moment.utc(message.guild!.createdAt).format(Constants.DATE_FORMAT);
      const region = message.guild!.region ? Constants.GUILD_REGIONS[message.guild!.region] : message.guild!.region;
      const verificationLevel = Constants.GUILD_VERIFICATION_LEVELS[message.guild!.verificationLevel];
      const explicitFilter = Constants.GUILD_EXPLICIT_FILTER[message.guild!.explicitContentFilter];
      const verifiedStatus = message.guild!.verified ? 'Yes' : 'No';

      // Guild Nitro Boost Information
      const boostTier = Constants.GUILD_TIERS[message.guild!.premiumTier];
      const boostCount = message.guild!.premiumSubscriptionCount;

      embed.setTitle(`Information on guild ${name}`);
      embed.setThumbnail(icon);
      embed.setColor(highestRole.hexColor);
      embed.setDescription(
        `**Name**: ${name}\n`
        + `**Owner**: ${owner}\n`
        + `**Members**: ${members} (${users} users, ${bots} bots)\n`
        + `**Members Online**: ${totalPresencces} (${userPresences} users, ${botPresences} bots)\n`
        + `**Channels**: ${channels} (${textChannels} text, ${voiceChannels} voice)\n`
        + `**Emojis**: ${emojis} (${normalEmojis} normal, ${animatedEmojis} animated)\n`
        + `**Region**: ${region}\n`
        + `**Creation Date**: ${created}\n`
        + `**Verification Level**: ${verificationLevel}\n`
        + `**Explicit Content Filter**: ${explicitFilter}\n`
        + `**Verified Server?** ${verifiedStatus}\n`
        + `**Roles (${roleCount})**: ${roles}\n\n`
        + '**__Nitro Boost Information__**:\n'
        + `**Boosting Tier**: ${boostTier}\n`
        + `**Users Boosting**: ${boostCount}`,
      );

      embed.setFooter(`${name} guild ID: ${id}`);

      await message.channel.send(embed);
    } else {
      this.client.logger.error('Guild not currently available...');
      message.author.dmChannel.send('This guild is not currently available, try again later.');
    }
  }
}
