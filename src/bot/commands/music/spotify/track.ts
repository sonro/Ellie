/**
 * track.ts -- Retrieves information on the specified Spotify track.
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

import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import Constants from '../../../utils/Constants';

const moment = require('moment');
require('moment-duration-format');

export default class SpotifyTrackCommand extends Command {
  public constructor() {
    super('spotify-track', {
      category: 'Music',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Displays information about the specified Spotify track.',
        usage: '<track>',
      },
      args: [
        {
          id: 'query',
          match: 'content',
          type: 'string',
        },
      ],
    });
  }

  public async exec(message: Message, { query }: { query: string }) {
    const trackEmbed = new MessageEmbed().setColor(0x1DB954);
    const errorEmbed = new MessageEmbed().setColor(0xB00020);

    if (!query) {
      errorEmbed.setTitle('Error: No track name provided.');
      errorEmbed.setDescription('You did not provide the name of the track you would '
        + 'like to get information on. Please provide one and then try again.');

      return message.channel.send(errorEmbed);
    }

    this.client.spotify.clientCredentialsGrant().then((data) => {
      this.client.spotify.setAccessToken(data.body.access_token);
      this.client.spotify.searchTracks(query, { limit: 1, offset: 0 }, async (err, res) => {
        if (err) {
          this.client.logger.error(err);
          return message.channel.send('Looks like an error occured while searching for a Spotify '
            + 'track. Please try again later.!');
        }

        try {
          const track = res.body.tracks.items[0];
          const parent = track.album;
          const title = track.name;
          const album = parent.name;
          const albumLink = parent.external_urls.spotify;
          const { popularity } = track;
          const explicit = track.explicit ? 'Yes' : 'No';
          const cover = parent.images[1].url;
          const markets = track.available_markets.length;
          const url = track.external_urls.spotify;
          const date = moment(track.album.release_date).format('LL');
          const artist = track.artists.map((a: any) => `[${a.name}](${a.external_urls.spotify})`).join(', ');
          const length = moment.duration(track.duration_ms, 'milliseconds').format('h[hr] mm[m] s[s]');

          this.client.spotify.getAudioAnalysisForTrack(track.id).then((resp) => {
            const analysis = resp.body.track;
            const key = Constants.MUSIC_PITCH_CLASSES[analysis.key];
            const keyConfidence = analysis.key_confidence;
            const { loudness } = analysis;
            const mode = Constants.MUSIC_MODES[analysis.mode];
            const modeConfidence = analysis.mode_confidence;
            const { tempo } = analysis;
            const tempoConfidence = analysis.tempo_confidence;
            const timeSignature = analysis.time_signature;
            const timeSignatureConfidence = analysis.time_signature_confidence;

            trackEmbed.setTitle(title);
            trackEmbed.setThumbnail(cover);
            trackEmbed.setDescription(
              `**Artist(s)**: ${artist}\n`
              + `**Album**: [${album}](${albumLink})\n`
              + `**Popularity**: ${popularity}\n`
              + `**Explicit?** ${explicit}\n`
              + `**Release Date**: ${date}\n`
              + `**Spotify Markets**: ${markets}\n`
              + `**Duration**: ${length}\n\n`
              + '**__Technical Details__**:\n'
              + `**Average Loudness**: ${loudness} dB\n`
              + `**Key**: ${key} (Confidence: ${keyConfidence})\n`
              + `**Mode**: ${mode} (Confidence: ${modeConfidence})\n`
              + `**Tempo**: ${tempo} (Confidence: ${tempoConfidence})\n`
              + `**Time Signature**: ${timeSignature} (Confidence: ${timeSignatureConfidence})\n\n`
              + `[Play ${title} on Spotify →](${url})`,
            );

            return message.channel.send(trackEmbed);
          });
        } catch (error) {
          this.client.logger.error(error.message);
          return message.channel.send('Sorry, I was unable to find that. Perhaps you made a typo? '
            + 'Or Spotify lacks the track you were searching for. Please try again later.');
        }
        return null;
      });

      return null;
    });

    return null;
  }
}
