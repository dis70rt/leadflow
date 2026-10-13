export function HighlightedText({ text }: { text: string }) {
  return text
    .split(/(\ue000[^\ue001]*\ue001)/g)
    .map((part, index) =>
      part.startsWith("\ue000") && part.endsWith("\ue001") ? (
        <mark key={index}>{part.slice(1, -1)}</mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
}
