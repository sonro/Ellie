use crate::ShardManagerContainer;

use chrono::offset::Utc;
use chrono::Duration;

use serenity::client::bridge::gateway::ShardId;
use serenity::client::Context;
use serenity::framework::standard::macros::command;
use serenity::framework::standard::CommandResult;
use serenity::model::prelude::Message;

#[command]
#[description("Checks the overall message latency.")]
#[usage("<blank>")]
fn ping(context: &mut Context, message: &Message) -> CommandResult {
    let start = Utc::now();
    let start_timestamp = start.timestamp();
    let start_timestamp_subsecs = start.timestamp_subsec_millis() as i64;
    let mut msg = message.channel_id.send_message(&context, |message| message.content(":ping_pong: Pinging!"))?;
    let end = Utc::now();
    let end_timestamp = end.timestamp();
    let end_timestamp_subsecs = end.timestamp_subsec_millis() as i64;

    let api_latency = ((end_timestamp - start_timestamp) * 1000) + (end_timestamp_subsecs - start_timestamp_subsecs);

    let data = context.data.read();
    let shard_manager = match data.get::<ShardManagerContainer>() {
        Some(shard) => shard,
        None => {
            message.reply(&context, "There was a problem getting the shard manager.")?;
            return Ok(());
        }
    };

    let manager = shard_manager.try_lock().ok_or("Couldn't get a lock on the manager")?;
    let runners = manager.runners.try_lock().ok_or("Couldn't get a lock on the current shard runner.")?;

    let runner = match runners.get(&ShardId(context.shard_id)) {
        Some(runner) => runner,
        None => {
            message.reply(&context, "Couldn't find any shards...")?;
            return Ok(());
        }
    };

    let latency = match runner.latency {
        Some(latency) => match Duration::from_std(latency) {
            Ok(milli) => format!("`{}ms`", milli.num_milliseconds()),
            Err(_) => "Could not get latency information... :(".to_string(),
        },
        None => "No data available yet.".to_string(),
    };

    let response = format!(
        "Pong! Succesfully retrieved the message and shard latencies. :ping_pong:\n\n\
        **API Latency**: `{}ms`\n\
        **Shard Latency**: {}",
        api_latency, latency
    );

    msg.edit(&context, |message| {
        message.content("");
        message.embed(|embed| {
            embed.color(0x008b_0000);
            embed.title("Discord Latency Information");
            embed.description(response)
        })
    })?;

    Ok(())
}
