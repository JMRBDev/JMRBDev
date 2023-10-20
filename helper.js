import fs from "fs";

const START_ANNOTATION = "<!-- BLOGPOSTS:START -->";
const END_ANNOTATION = "<!-- BLOGPOSTS:END -->";

export const formatToMarkdown = (feed, num) => {
  let md = "";

  for (let i = 0; i < num; i += 1) {
    const item = feed[i];
    if (item) {
      md += `
<a href="${item.link}" target="_blank">
  <p align="center">
    <img width='50%' src='${item.enclosure.url}' alt='Thumbnail for post called ${item.title}' style="border-radius: 18px;" />
  </p>
  <h3 align="center">${item.title}</h3>
  <p align="center" style="font-size: 11px;">${item.content}</p>
</a>

<hr />
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
