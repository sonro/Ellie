# Ellie Changelog

All notable changes to Ellie will be documented in this file. This project adheres
to the [Semantic Versioning][semver] specification.

## [0.5.1 Boron][0.5.1] - Not yet released

### New Features

- Commands
  - Added `ascii` command with font support!

### Improvements

- Commands
  - `channel`: Improved the parsing of channels. It now recognizes strings, channel mentions,
    and generic search strings. This does **NOT** support trying to search for channels by
    separating with a space, due to Discord channel names not supporting spaces.
  - `changelog`: Improved the embed's title to be more informative.
  - `weather`: Added support for user locations.
  - `profile`: Implemented the ability to set a location.

### Fixes

- Dispatcher
  - Fixed a bug where if more arguments were supplied to a command supporting `min_args` and
    `max_args`, Ellie would erroneously log a Dispatcher error. This is now fixed, and Ellie
    properly responds when more or less arguments that are required are fed to a command.

## [0.5.0 Boron][0.5.0] - February 9, 2020

Fairly significant update, adding various commands, and vastly improving most other
commands. This also includes various bug fixes, but they are squeezed together as
part of the various improvements to commands.

### New Features

- General

  - Added a GitHub Actions pipeline that runs on every commit that runs `cargo check`
    and several Rust formatting utilities like `clippy` and `rustfmt` to help make
    sure that the project is adhering to normal Rust code styling.
  - Added this changelog!
  - Updated several dependencies.

- Commands
  - Added `changelog` command. Polls the GitHub GraphQL API for recent commits to
    Ellie's master branch.
  - Added `source` command. Sends a message containing a URL to the bot's source
    code.
  - `github`
    - Added `repository` command. Retrieves information about a GitHub repository.
    - Added `user` command. Retrieves information about a GitHub user.
  - `info`
    - Added `role` command. Retrieves information on a specified guild role.
    - Added `channel` command. Retrieves information about a specified guild channel
      or category.
  - `profile`
    - Added Twitch, PlayStation and Xbox user ID support. PlayStation and Xbox user
      IDs however do not currently link to anything as Microsoft and Sony do not
      allow profiles to be publicly displayed, and as such this information will
      be purely for lookup purposes.
  - `reddit`
    - Added `user` command. Gets information about a specified Reddit user.
    - Added `subreddit` command. Gets information about a specified subreddit on
      Reddit.
  - `spotify`
    - Added `credits` command. Shows the credits for a specified track.
    - Added `artist` command. Retrieves information about a Spotify artist.
    - Added `status` command. Retrieves the message author's, or a specified users'
      Spotify status.
  - `user`
    - Added rich presence support for Spotify and Visual Studio Code.
  - voice:
    - Added a basic subset of voice commands. This includes `play`, `leave`, and
      `join`.They're not that fully featured due to various issues with serenity's
      voice implementation, however there are plans on the serenity developer's
      roadmap to improve / revamp serenity's voice subsystem, so hopefully once it's
      revamped, this command set will get an overhaul.

### Improvements

- Commands
  - `guild`
    - Improved the way `str`'s are handled, reducing a lot of the `to_owned()`
      cloning that was previously done.
    - Added support for viewing the guild's multi-factor authentication level.
    - Added support for displaying "x users, x bots" for Members.
    - Dropped the filtering of channel categories for the channel count and instead
      provided an additional filtering type for categories that shows up next to
      the total amount of channels.
  - `lastfm`
    - Improved the way Last.fm errors are handled, and more errors are now handled,
      such as `OperationFailed`.
    - Removed unnecessary logging. Specifically, Ellie no longer warns when no track
      attributes could be found for a track, as that is expected behavior for Last.fm
      tracks that aren't currently being scrobbled.
    - Improved the way album artwork is retrieved, moving entirely to the Spotify
      Web API for album artwork
      retrieval instead of going through both the Last.fm and Spotify Web API endpoints.
  - `profile`
    - Improved the way users are parsed, and Discord user IDs are now
      supported when looking up a profile.
  - `spotify`
    - Cleaned up the general structure of the Spotify command system.
  - `user`
    - Roles are now @'d. They now show up in their beautuiful colored form.
    - Added a Profile field. This just @'s a user's handle silently and allows you
      to view the user's profile just by clicking the name. **Note**: This does not
      work on mobile due to the way Discord handles the embed system on mobile devices.
    - Completely revamped how Online Statuses are handled. This entails various
      enhancements such as being able to view a user's client status, and see any
      and all activities the user is doing with the exception of being able to view
      Custom Statuses, which are not supported due to how they would look with any
      other activities. At some point, I may look into adding support for Custom
      Statuses, depending on if I can find a solution I like with regards to this.
    - Just like with `profile`, user parsing has been improved.

[semver]: http://semver.org
[0.5.0]: https://github.com/KamranMackey/Ellie/compare/v0.4.2..v0.5.0
[0.5.1]: https://github.com/KamranMackey/Ellie/compare/v0.5.0..master
