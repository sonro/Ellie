use crate::spotify;
use crate::utilities::parse_user;

use itertools::Itertools;

use serenity::client::Context;
use serenity::framework::standard::macros::command;
use serenity::framework::standard::Args;
use serenity::framework::standard::CommandResult;
use serenity::model::gateway::Activity;
use serenity::model::gateway::ActivityType::{Custom, Listening, Playing, Streaming, Watching};
use serenity::model::guild::Role;
use serenity::model::prelude::Message;
use serenity::model::user::OnlineStatus;
use serenity::utils::Colour;

use log::info;

#[command]
#[description = "Shows various information about a user."]
#[usage = "<user> or <blank>"]
#[aliases("user", "userinfo", "uinfo", "u")]
#[only_in("guilds")]
pub fn user(context: &mut Context, message: &Message, args: Args) -> CommandResult {
    let cache = &context.cache;
    let guild_id = message.guild_id.ok_or("Failed to get GuildID from Message.")?;
    let cached_guild = cache.read().guild(guild_id).ok_or("Unable to retrieve guild")?;
    let member = if message.mentions.is_empty() {
        if args.is_empty() {
            message.member(&context).ok_or("Could not find member.")?
        } else {
            match parse_user(&args.rest(), Some(&guild_id), Some(&context)) {
                Some(i) => guild_id.member(&context, i)?,
                None => return Ok(()),
            }
        }
    } else {
        guild_id.member(&context, message.mentions.first().ok_or("Failed to get user mentioned.")?)?
    };

    let user = member.user.read();
    let guild = cached_guild.read();

    let mut track_art: String = String::new();
    let mut activities: String = String::new();
    let mut active_status: String = String::new();

    if !guild.presences.get(&user.id).is_none() || guild.presences.get(&user.id).is_none() {
        let presence = guild.presences.get(&user.id).unwrap();

        activities = presence.activities.iter().filter(|a| a.kind != Custom).map(|a: &Activity| {
            let mut activity_name = a.name.as_str();
            let activity_kind = match a.kind {
                Listening => {
                    if activity_name == "Spotify" {
                        let song = a.details.as_ref().unwrap();
                        let artist = a.state.as_ref().unwrap().replace(";", " & ");
                        let album = a.assets.as_ref().unwrap().large_text.as_ref().unwrap();
                            
                        let sp_search_string = format!(
                            "track: {track} artist: {artists} album: {album}",
                            track = song,
                            artists = artist.replace("&", "AND"),
                            album = album.replace("&", "%26")
                        );
                            
                        let sp_track_search = spotify().search_track(sp_search_string.as_str(), 1, 0, None);
                        let sp_track_result = &sp_track_search.unwrap();
                        let results = &sp_track_result.tracks.items;
                        let track = results.first().unwrap();
                        let image = track.album.images.first().unwrap();
                        let album_art = image.url.as_str();
                            
                        track_art.push_str(album_art);
                            
                        format!("listening to **{}** by **{}** on the album **{}** via", song, artist, album)
                    } else {
                        "listening to".to_owned()
                    }
                }
                Playing => {
                    if activity_name == "Visual Studio Code" {
                        let file = a.details.as_ref().unwrap().replace("Editing ", "");
                        let project = a.state.as_ref().unwrap().replace("Workspace: ", "");
                        let app = a.assets.as_ref().unwrap().small_text.as_ref().unwrap();
                        activity_name = app;
                        format!("working on the file **{}** in the project **{}** with", file, project)
                    } else {
                        "playing".to_owned()
                    }
                }
                Watching => "watching".to_owned(),
                Streaming => "streaming on".to_owned(),
                _ => "".to_owned(),
            };
            format!("{} **{}**", activity_kind, activity_name)
        }).join(" and ");

        let currently_status: String = format!("{} is currently ", user.name);

        active_status.push_str(currently_status.as_str());

        let status = match presence.status {
            OnlineStatus::Online => "Online",
            OnlineStatus::Idle => "Idle",
            OnlineStatus::DoNotDisturb => "Do Not Disturb",
            OnlineStatus::Invisible => "Invisible",
            _ => "Offline",
        };

        if status != "Do Not Disturb" {
            active_status.push_str("**");
            active_status.push_str(status);
            active_status.push_str("**");
        } else {
            active_status.push_str("in **Do Not Disturb** mode");
        }

        if activities.is_empty() {
            active_status.push_str(".\n\n")
        }
    };

    if !activities.is_empty() {
        activities = format!("; {}.\n\n", activities);
    }

    let account_type = if user.bot { "Bot" } else { "User" };

    let created = user.created_at().format("%A, %B %e, %Y @ %l:%M %P");
    let tag = user.tag();
    let id = user.id;
    let color: Colour;
    let hex: String;

    if member.colour(cache).is_none() {
        color = Colour::new(0x00FF_FFFF);
        hex = "No display color available.".to_owned()
    } else {
        color = member.colour(cache).unwrap();
        hex = format!("#{}", color.hex().to_lowercase());
    }

    let mut roles = String::new();
    let mut role_count = 0;

    if !member.roles(&cache).is_none() {
        roles = member.roles(&cache).unwrap().iter().map(|r: &Role| &r.name).join(" / ");
        role_count = member.roles(&cache).unwrap().len();
        if roles.is_empty() {
            roles = "No roles available.".to_owned();
        }
    }

    let main_role = if member.highest_role_info(&cache).is_none() {
        info!("Cannot get role information.");
        "No main role available.".to_owned()
    } else {
        let hoist_role_id = member.highest_role_info(&cache).ok_or("cannot get role id")?.0;
        let hoist_role = guild.roles.get(&hoist_role_id).ok_or("Cannot get role")?;
        hoist_role.name.to_owned()
    };

    let nickname = member.nick.map_or("No nickname has been set.".to_owned(), |nick| nick);
    let joined = member.joined_at.map_or("Unavailable".to_owned(), |d| {
        let formatted_string = d.format("%A, %B %e, %Y @ %l:%M %P");
        format!("{}", formatted_string)
    });

    message.channel_id.send_message(&context, |message| {
        message.embed(|embed| {
            embed.author(|author| {
                author.name(&user.name);
                author.icon_url(&user.face())
            });
            embed.thumbnail(track_art);
            embed.colour(color);
            embed.description(format!(
                "{}{}\
                **__User Information__**:\n\
                **Type**: {}\n\
                **Tag**: {}\n\
                **ID**: {}\n\
                **Creation Date**: {}\n\n\
                **__Guild-related Information__**:\n\
                **Join Date**: {}\n\
                **Nickname**: {}\n\
                **Display Color**: {}\n\
                **Main Role**: {}\n\
                **Roles ({})**: {}",
                active_status, activities, account_type, tag, id, created, joined, nickname, hex, main_role, role_count, roles
            ))
        })
    })?;

    Ok(())
}
