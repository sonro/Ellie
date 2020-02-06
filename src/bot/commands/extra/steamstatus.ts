/**
 * steamstatus.ts -- Retrieves the current status of Steam. Uses a
 * combination of steamgaug.es and steamstat.us to get the status.
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
import Constants from '../../utils/Constants';

export default class SteamStatusCommand extends Command {
  public constructor() {
    super('steamstatus', {
      aliases: ['steamstatus'],
      category: 'Extra',
      description: {
        content: 'Displays the current status of Steam.',
        usage: '<blank>',
      },
    });
  }

  public static async exec(message: Message) {
    const embed = new MessageEmbed();
    const STEAM_STATUS_REQUEST = await request.get('https://crowbar.steamstat.us/Barney');

    if (STEAM_STATUS_REQUEST.status === 500) {
      return message.channel.send(
        'Looks like steamstat.us is currently offline, so I am unable to '
        + 'retrieve the current Steam status at this time. Please try again '
        + 'later.',
      );
    }

    const STEAM_COMMUNITY = STEAM_STATUS_REQUEST.body.services.community.title;
    const STEAM_STORE = STEAM_STATUS_REQUEST.body.services.store.title;
    const STEAM_USER_API = STEAM_STATUS_REQUEST.body.services.webapi.title;
    const STEAM_USERS_ONLINE = STEAM_STATUS_REQUEST.body.services.online.title;
    const STEAM_CMS = STEAM_STATUS_REQUEST.body.services.cms.title;
    const STEAM_DB = STEAM_STATUS_REQUEST.body.services.database.title;
    const STEAM_ARTIFACT = STEAM_STATUS_REQUEST.body.services.artifact.title;
    const STEAM_CSGO = STEAM_STATUS_REQUEST.body.services.csgo.title;
    const STEAM_DOTA_2 = STEAM_STATUS_REQUEST.body.services.dota2.title;
    const STEAM_TF2 = STEAM_STATUS_REQUEST.body.services.tf2.title;
    const STEAM_UNDERLORDS = STEAM_STATUS_REQUEST.body.services.underlords.title;
    const STEAM_CSGO_SESSIONS = STEAM_STATUS_REQUEST.body.services.csgo_sessions.title;
    const STEAM_CSGO_INVENTORIES = STEAM_STATUS_REQUEST.body.services.csgo_community.title;
    const STEAM_CSGO_MM_SCHEDULER = STEAM_STATUS_REQUEST.body.services.csgo_mm_scheduler.title;

    embed.setTitle('Steam Status');
    embed.setThumbnail(Constants.STEAM_LOGO);
    embed.setURL('https://store.steampowered.com');
    embed.setColor(0x66c0f4);
    embed.setDescription(
      '**__Steam Services__**:\n'
      + `**Users Online on Steam**: ${STEAM_USERS_ONLINE}\n`
      + `**Steam Community**: ${STEAM_COMMUNITY}\n`
      + `**Steam Store**: ${STEAM_STORE}\n`
      + `**Steam Web API**: ${STEAM_USER_API}\n`
      + `**Steam Connection Managers**: ${STEAM_CMS}\n\n`
      + '**__Game Coordinators__**:\n'
      + `**Artifact**: ${STEAM_ARTIFACT}\n`
      + `**Counter-Strike: Global Offensive**: ${STEAM_CSGO}\n`
      + `**Dota 2**: ${STEAM_DOTA_2}\n`
      + `**Team Fortress 2**: ${STEAM_TF2}\n`
      + `**Underlords**: ${STEAM_UNDERLORDS}\n\n`
      + '**__Counter-Strike: Global Offensive__**:\n'
      + `**Sessions Logon**: ${STEAM_CSGO_SESSIONS}\n`
      + `**Player Inventories**: ${STEAM_CSGO_INVENTORIES}\n`
      + `**Matchmaking Scheduler**: ${STEAM_CSGO_MM_SCHEDULER}\n\n`
      + '**__Other Services__**:\n'
      + `**[Steam Database](https://steamdb.info)**: ${STEAM_DB}\n`,
    );
    embed.setFooter('Powered by the steamstat.us API');
    embed.setTimestamp();

    return message.channel.send(embed);
  }
}
