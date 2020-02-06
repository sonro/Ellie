/**
 * pokemon.ts -- Retrieves information on the specified Pokémon.
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
import Pokedex from 'pokedex-promise-v2';
import Util from '../../../utils/Util';

export default class PokemonCommand extends Command {
  public constructor() {
    super('pokemon', {
      aliases: ['pokemon', 'poke', 'pokedex'],
      category: 'Search',
      description: {
        content: 'Retrieves information on the specified Pokémon.',
        usage: '<pokemon>',
      },
      args: [
        {
          id: 'pokemon',
          match: 'content',
        },
      ],
    });
  }

  public async exec(message: Message, { pokemon }: { pokemon: string }) {
    const endpoint = new Pokedex();
    const pokemonLowercase = pokemon.toLowerCase();
    const mainApi = `api/v2/pokemon/${pokemonLowercase}`;
    const speciesApi = `api/v2/pokemon-species/${pokemonLowercase}`;

    endpoint.resource([mainApi, speciesApi]).then((res) => {
      const embed = new MessageEmbed();
      const name = res[0].name.replace(/^\w/, (c: string) => c.toUpperCase());
      const bulbapediaUrl = `https://bulbapedia.bulbagarden.net/wiki/${name}`;
      const height = `**Height**: ${res[0].height / 10}m`;
      const weight = `**Weight**: ${res[0].weight / 10}kg`;
      // This is not the best looking code in existence, but it gets the job done nicely.
      const abilities = `**Abilities**: ${res[0].abilities.map((a: any) => Util.convertToTitleCase(a.ability.name).replace('-', ' ')).join(', ')}`;

      let flavorText: string;
      let type: string;
      let id = JSON.stringify(res[1].id);

      if (res[1].flavor_text_entries[1].language.name === 'en') {
        flavorText = res[1].flavor_text_entries[1].flavor_text;
      } else {
        flavorText = res[1].flavor_text_entries[2].flavor_text;
      }

      if (id.length === 2) {
        id = `0${res[1].id}`;
      } else if (id.length === 1) {
        id = `00${res[1].id}`;
      } else {
        id = res[1].id;
      }

      const thumbnail = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png`;

      if (typeof res[0].types[1] !== 'undefined') {
        type = `**Types**: ${res[0].types[1].type.name.replace(/^\w/, (c: string) => c.toUpperCase())} `
          + `and ${res[0].types[0].type.name.replace(/^\w/, (c: string) => c.toUpperCase())}`;
      } else {
        type = `**Type**: ${res[0].types[0].type.name.replace(/^\w/, (c: string) => c.toUpperCase())}`;
      }

      embed.setTitle(name);
      embed.setColor(0xFFCB05);
      embed.setThumbnail(thumbnail);
      embed.setDescription(
        `${type}\n`
        + `${height}\n`
        + `${weight}\n`
        + `${abilities}\n\n`
        + `${flavorText}\n\n`
        + `More information about **${name}** is available on [Bulbapedia](${bulbapediaUrl}).`,
      );
      embed.setFooter(`Pokédex entry ${id} | Powered by PokéAPI.`);

      return message.channel.send(embed);
    }).catch((err) => {
      this.client.logger.error(err);
    });
  }
}
