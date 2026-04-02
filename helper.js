import { readFile, writeFile } from "node:fs/promises";

const START_MARKER = "<!-- BLOGPOSTS:START -->";
const END_MARKER = "<!-- BLOGPOSTS:END -->";
const SUMMARY_LIMIT = 180;

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ");
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(text, maxLength = SUMMARY_LIMIT) {
  if (text.length <= maxLength) {
    return text;
  }

  const shortened = text.slice(0, maxLength).trimEnd();
  const lastSpaceIndex = shortened.lastIndexOf(" ");

  if (lastSpaceIndex <= 0) {
    return `${shortened}...`;
  }

  return `${shortened.slice(0, lastSpaceIndex)}...`;
}

function getSummary(item) {
  const rawSummary =
    item.contentSnippet ??
    item.summary ??
    item.content ??
    item["content:encoded"] ??
    "";

  const summary = normalizeWhitespace(
    decodeHtmlEntities(stripHtml(rawSummary)),
  );
  return summary ? truncate(summary) : "Read the full post on the blog.";
}

function normalizePosts(feedItems, count) {
  const posts = [];

  for (const item of feedItems) {
    if (posts.length >= count) {
      break;
    }

    const title = normalizeWhitespace(item.title);
    const link = normalizeWhitespace(item.link);

    if (!title || !link) {
      continue;
    }

    posts.push({
      title,
      link,
      summary: getSummary(item),
    });
  }

  return posts;
}

export function formatPosts(feedItems, count) {
  const posts = normalizePosts(feedItems, count);

  if (posts.length === 0) {
    return "<p>No posts found.</p>";
  }

  return posts
    .map(
      ({ title, link, summary }) =>
        `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
  <h3>${escapeHtml(title)}</h3>
  <p style="font-size: 11px;">${escapeHtml(summary)}</p>
</a>`,
    )
    .join("\n\n<hr />\n\n");
}

export function spliceSection(content, replacement) {
  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER);

  if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
    throw new Error("README markers were not found or are in the wrong order.");
  }

  const before = content.slice(0, startIndex + START_MARKER.length);
  const after = content.slice(endIndex);

  return `${before}\n\n${replacement}\n${after}`;
}

export async function replaceSection(filePath, replacement) {
  const currentContent = await readFile(filePath, "utf8");
  const nextContent = spliceSection(currentContent, replacement);

  if (nextContent !== currentContent) {
    await writeFile(filePath, nextContent);
  }
}
