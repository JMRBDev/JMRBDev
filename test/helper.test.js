import test from "node:test";
import assert from "node:assert/strict";

import { formatPosts, spliceSection } from "../helper.js";

test("formatPosts renders the current README HTML layout", () => {
  const markup = formatPosts(
    [
      {
        title: "Hello <World>",
        link: "https://example.com/post?x=1&y=2",
        content:
          "<p>This is a <strong>post</strong> summary with enough words to render cleanly.</p>",
      },
      {
        title: "Another Post",
        link: "https://example.com/another",
        contentSnippet: "Short summary",
      },
    ],
    2,
  );

  assert.match(
    markup,
    /<h3><a href="https:\/\/example.com\/post\?x=1&amp;y=2">Hello &lt;World&gt;<\/a><\/h3>/,
  );
  assert.match(
    markup,
    /This is a post summary with enough words to render cleanly\./,
  );
  assert.match(markup, /<br \/>/);
  assert.match(markup, /Short summary/);
});

test("formatPosts skips invalid items and falls back when a summary is missing", () => {
  const markup = formatPosts(
    [
      { title: "", link: "https://example.com/invalid" },
      { title: "Valid", link: "https://example.com/valid" },
    ],
    2,
  );

  assert.doesNotMatch(markup, /invalid/);
  assert.match(markup, /Read the full post on the blog\./);
});

test("spliceSection replaces content between markers", () => {
  const result = spliceSection(
    `Header
<!-- BLOGPOSTS:START -->
Old
<!-- BLOGPOSTS:END -->
Footer`,
    "<p>New</p>",
  );

  assert.equal(
    result,
    `Header
<!-- BLOGPOSTS:START -->

<p>New</p>
<!-- BLOGPOSTS:END -->
Footer`,
  );
});

test("spliceSection supports markers at the start of a file", () => {
  const result = spliceSection(
    `<!-- BLOGPOSTS:START -->
Old
<!-- BLOGPOSTS:END -->`,
    "New",
  );

  assert.equal(
    result,
    `<!-- BLOGPOSTS:START -->

New
<!-- BLOGPOSTS:END -->`,
  );
});

test("spliceSection throws when markers are missing", () => {
  assert.throws(() => spliceSection("No markers here", "New"), /markers/);
});
