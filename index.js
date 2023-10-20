import core from "@actions/core";
import Parser from "rss-parser";
import { formatToMarkdown, replaceMd } from "./helper.js";

let parser = new Parser();

const getRSSFeed = async (feedURL) => {
  let feed = await parser.parseURL(feedURL);
  return feed.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
};

const main = async () => {
  try {
    const count = Number.parseInt(core.getInput("count"));
    const feedURL = core.getInput("feed_url");
    const readmePath = core.getInput("readme_path");

    // For running locally
    // const count = 6;
    // const feedURL = "https://www.jmrb.dev/rss.xml";
    // const readmePath = "README.md";

    const feed = await getRSSFeed(feedURL);

    const mdFeed = formatToMarkdown(feed, count);

    replaceMd(readmePath, mdFeed);
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
