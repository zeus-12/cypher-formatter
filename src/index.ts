import { testCases } from "./test";
import { countOccurrences } from "./util";

const formattedQuery = (query: string) => {
  let formattedQuery = query.replace(
    /\b(CALL|WHEN|CASE|AND|OR|XOR|DISTINCT|AS|IN|STARTS WITH|ENDS WITH|CONTAINS|NOT|SET|ORDER BY|SET|NULL|TRUE|FALSE)\b/gi,
    function (match) {
      if (["NULL", "TRUE", "FALSE"].includes(match.toUpperCase())) {
        return " " + match.toLowerCase().trim() + " ";
      } else {
        let leadingSpace = query[query.indexOf(match) - 1] !== " " ? " " : "";
        let trailingSpace =
          query[query.indexOf(match) + match.length] !== " " ? " " : "";
        return leadingSpace + match.toUpperCase().trim() + trailingSpace;
      }
    }
  );

  formattedQuery = formattedQuery.replace(
    /\b(CASE|DETACH DELETE|DELETE|MATCH|MERGE|LIMIT|OPTIONAL MATCH|RETURN|UNWIND|UNION|WHERE|WITH|GROUP BY)\b/gi,
    function (match) {
      // if match == "with", make sure the previous word isnt "starts" or "ends"
      if (match.toUpperCase() === "WITH") {
        const previousWord = formattedQuery
          .substring(0, formattedQuery.indexOf(match))
          .trim()
          .split(" ")
          .pop();

        if (
          previousWord &&
          ["STARTS", "ENDS"].includes(previousWord.toUpperCase())
        ) {
          return match.toLowerCase().trim();
        }
      }

      return "\n" + match.toUpperCase().trimStart();
    }
  );

  let openedParanthesesCount = 0;
  let openedCurlyBracketsCount = 0;

  for (let i = 0; i < formattedQuery.length; i++) {
    const char = formattedQuery[i];

    if (char === "(") {
      openedParanthesesCount++;
    } else if (char === ")") {
      openedParanthesesCount--;
    } else if (char === "{") {
      openedCurlyBracketsCount++;
    } else if (char === "}") {
      openedCurlyBracketsCount--;
    }

    if (openedParanthesesCount < 0 || openedCurlyBracketsCount < 0) {
      throw new Error("Invalid query");
    }
  }

  if (openedParanthesesCount !== 0 || openedCurlyBracketsCount !== 0) {
    throw new Error("Invalid query");
  }

  let formatted = "";
  let indentationLevel = 0;
  const lines = formattedQuery
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const unformatted = lines.join("\n");

  lines.forEach((line) => {
    // add space after "",""
    line = line.replace(/,(?!\s)/g, ", ").replace(/,\s+/g, ", ");

    // add space before "{""
    line = line.replace(/\{/g, " { ").replace(/\}/g, " }");

    // this breaks for relationships where "":"" is used
    // line = line.replace(/:(?!\s)/g, ": ").replace(/:\s+/g, ": ");

    const closingParanthesesCount = countOccurrences(line, ")");

    const openingBracketCount =
      countOccurrences(line, "(") + countOccurrences(line, "{");

    const closingBracketCount =
      closingParanthesesCount + countOccurrences(line, "}");

    if (line.trim().length === closingBracketCount && closingBracketCount > 0) {
      const brackets = [];

      for (const char of line) {
        if (char === ")" || char === "}") {
          brackets.push(char);
        } else {
          break;
        }
      }

      for (let i = 0; i < closingBracketCount; i++) {
        indentationLevel -= 1;
        formatted += `${" ".repeat(indentationLevel * 2)}${brackets.shift()}\n`;
      }
    } else if (closingBracketCount > 0 || openingBracketCount > 0) {
      line = line.replace(/ {([\S\s]*?)}/g, function (match) {
        let block = match
          .trim()
          .substring(1, match.trim().length - 1)
          .trim();
        return (
          "{\n" +
          " ".repeat((indentationLevel + 1) * 2) +
          block.replace(/(\r\n|\n|\r)/gm, "\n  ") +
          `\n${" ".repeat(indentationLevel * 2)}}`
        );
      });

      formatted += `${" ".repeat(indentationLevel * 2)}${line}\n`;
      indentationLevel += openingBracketCount - closingBracketCount;
    } else {
      formatted += `${" ".repeat(indentationLevel * 2)}${line}\n`;
    }
  });

  formatted = formatted.replace(/\n\s*\n/g, "\n"); // remove multiple empty newlines

  // return { formatted: formatted.trim(), unformatted };
  return formatted.trim();
};

for (const testCase of testCases) {
  console.log(formattedQuery(testCase), "\n\n");
}
