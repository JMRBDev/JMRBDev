import fs from "fs";

const START_ANNOTATION = "<!-- BLOGPOSTS:START -->";
const END_ANNOTATION = "<!-- BLOGPOSTS:END -->";

export const formatToMarkdown = (feed, num) => {
  let md = "";

  for (let i = 0; i < num; i += 1) {
    const item = feed[i];
    if (item) {
      md += `
### [${item.title}](${item.link})
${item.content}

<br />
`;
    }
  }
  return md;
};

export const replaceMd = (filepath, newContent) => {
  const data = fs.readFileSync(filepath, { encoding: "utf8", flag: "r" });
  const fileContents = data.toString();

  const newFileContent = spliceMd(fileContents, newContent);

  fs.writeFileSync(filepath, newFileContent);
};

export const spliceMd = (oldContent, postsMd) => {
  const startIndex = oldContent.indexOf(START_ANNOTATION);
  const endIndex = oldContent.indexOf(END_ANNOTATION);
  if (startIndex > 0 && endIndex > 0) {
    const start = oldContent.slice(0, startIndex + START_ANNOTATION.length);
    const end = oldContent.slice(endIndex);
    return start + "\n" + postsMd + end;
  } else {
    return oldContent;
  }
};
