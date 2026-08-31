function splitCells(line: string) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isSeparator(line: string) {
  const cells = splitCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")));
}

function isTableRow(line: string) {
  return line.includes("|") && splitCells(line).length >= 2;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="rounded-md bg-black/40 px-1.5 py-0.5 text-[12px] text-accent">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

type Block =
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "paragraph"; text: string };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (
      isTableRow(line) &&
      isSeparator(lines[index + 1] ?? "") &&
      isTableRow(lines[index + 2] ?? "")
    ) {
      const headers = splitCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && isTableRow(lines[index] ?? "") && !isSeparator(lines[index] ?? "")) {
        rows.push(splitCells(lines[index] ?? ""));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test((lines[index] ?? "").trim())) {
        items.push((lines[index] ?? "").trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quoted: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
        quoted.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quoted.join(" ") });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() &&
      !/^(#{1,3})\s+/.test((lines[index] ?? "").trim()) &&
      !/^[-*]\s+/.test((lines[index] ?? "").trim()) &&
      !(
        isTableRow(lines[index] ?? "") &&
        isSeparator(lines[index + 1] ?? "")
      )
    ) {
      paragraph.push((lines[index] ?? "").trim());
      index += 1;
    }
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    }
  }

  return blocks;
}

export function CoachMarkdown({ text }: { text: string }) {
  if (!text.trim()) return null;
  const blocks = parseBlocks(text);

  return (
    <div className="coach-md space-y-4 text-sm leading-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          return (
            <Tag key={index} className="font-serif text-xl tracking-tight text-balance">
              <Inline text={block.text} />
            </Tag>
          );
        }
        if (block.type === "table") {
          return (
            <div key={index} className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[36rem] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-accent/12 text-accent">
                    {block.headers.map((header, headerIndex) => (
                      <th key={headerIndex} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                        <Inline text={header} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white/[0.03]" : "bg-black/20"}
                    >
                      {block.headers.map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-3 py-2.5 align-top ${cellIndex === 0 ? "font-medium text-accent whitespace-nowrap" : "text-foreground/90"}`}
                        >
                          <Inline text={row[cellIndex] ?? ""} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                >
                  <span className="mr-2 text-accent">▸</span>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "quote") {
          return (
            <p key={index} className="border-l-2 border-accent/60 pl-3 text-muted">
              <Inline text={block.text} />
            </p>
          );
        }
        return (
          <p key={index}>
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
