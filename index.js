import * as core from "@actions/core";
import Parser from "rss-parser";
import { formatPosts, replaceSection } from "./helper.js";

const parser = new Parser();

function parseCount(value) {
  const count = Number.parseInt(value, 10);

  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Invalid count "${value}". Expected a positive integer.`);
  }

  return count;
}

function parseFeedUrl(value) {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Invalid feed_url "${value}". Expected an absolute URL.`);
  }
}

function getPublishedAt(item) {
  const rawValue = item.isoDate ?? item.pubDate ?? item.published ?? item.updated;

  if (!rawValue) {
    return null;
  }

  const timestamp = Date.parse(rawValue);
  return Number.isNaN(timestamp) ? null : timestamp;
}

async function getFeedItems(feedUrl) {
  const feed = await parser.parseURL(feedUrl);
  const items = Array.isArray(feed.items) ? feed.items : [];

  return items
    .map((item, index) => ({
      item,
      index,
      publishedAt: getPublishedAt(item),
    }))
    .sort((left, right) => {
      if (left.publishedAt === right.publishedAt) {
        return left.index - right.index;
      }

      if (left.publishedAt === null) {
        return 1;
      }

      if (right.publishedAt === null) {
        return -1;
      }

      return right.publishedAt - left.publishedAt;
    })
    .map(({ item }) => item);
}

async function main() {
  try {
    const count = parseCount(core.getInput("count") || "6");
    const feedUrl = parseFeedUrl(core.getInput("feed_url", { required: true }));
    const readmePath = core.getInput("readme_path", { required: true });

    const items = await getFeedItems(feedUrl);
    const postsMarkup = formatPosts(items, count);

    await replaceSection(readmePath, postsMarkup);
    core.info(`Updated ${readmePath} with ${Math.min(count, items.length)} post(s).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    core.setFailed(message);
  }
}

await main();
